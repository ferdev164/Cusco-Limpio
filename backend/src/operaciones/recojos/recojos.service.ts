import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conductor } from '../../usuarios/entities/conductor.entity';
import { Programacion } from '../entities/programacion.entity';
import { EstadoRecojo, Recojo } from '../entities/recojo.entity';

@Injectable()
export class RecojosService {
  constructor(
    @InjectRepository(Recojo) private recojosRepo: Repository<Recojo>,
    @InjectRepository(Programacion)
    private programacionesRepo: Repository<Programacion>,
    @InjectRepository(Conductor)
    private conductoresRepo: Repository<Conductor>,
  ) {}

  private async conductorDe(usuarioId: number) {
    const conductor = await this.conductoresRepo.findOne({
      where: { usuario: { id: usuarioId } },
    });
    if (!conductor) {
      throw new NotFoundException('Esta cuenta no tiene un perfil de conductor');
    }
    return conductor;
  }

  async misProgramaciones(usuarioId: number) {
    const conductor = await this.conductorDe(usuarioId);

    const programaciones = await this.programacionesRepo.find({
      where: { conductor: { id: conductor.id } },
      order: { id: 'DESC' },
    });

    const activos = await this.recojosRepo.find({
      where: { estado: EstadoRecojo.EN_CURSO },
    });

    return programaciones.map((programacion) => {
      const recojoActivo = activos.find(
        (recojo) => recojo.programacion.id === programacion.id,
      );
      return {
        id: programacion.id,
        zona: programacion.horario?.zona?.nombre || null,
        turno: programacion.horario?.turno || null,
        horaInicioTurno: programacion.horario?.horaInicio || null,
        horaFinTurno: programacion.horario?.horaFin || null,
        dias: programacion.horario?.dias || null,
        vehiculo: programacion.vehiculo?.placa || null,
        recojoActivo: recojoActivo
          ? { id: recojoActivo.id, horaInicio: recojoActivo.horaInicio }
          : null,
      };
    });
  }

  async iniciar(usuarioId: number, programacionId: number) {
    const conductor = await this.conductorDe(usuarioId);

    const programacion = await this.programacionesRepo.findOne({
      where: { id: programacionId },
    });
    if (!programacion) throw new NotFoundException('Turno no encontrado');
    if (programacion.conductor?.id !== conductor.id) {
      throw new ForbiddenException('Este turno no esta asignado a tu cuenta');
    }

    const yaEnCurso = await this.recojosRepo.findOne({
      where: {
        programacion: { id: programacionId },
        estado: EstadoRecojo.EN_CURSO,
      },
    });
    if (yaEnCurso) {
      throw new ConflictException('Ya hay un recojo en curso para este turno');
    }

    const recojo = this.recojosRepo.create({
      programacion,
      horaInicio: new Date(),
      estado: EstadoRecojo.EN_CURSO,
    });
    await this.recojosRepo.save(recojo);

    return { id: recojo.id, horaInicio: recojo.horaInicio };
  }

  async finalizar(usuarioId: number, recojoId: number) {
    const conductor = await this.conductorDe(usuarioId);

    const recojo = await this.recojosRepo.findOne({ where: { id: recojoId } });
    if (!recojo) throw new NotFoundException('Recojo no encontrado');
    if (recojo.programacion.conductor?.id !== conductor.id) {
      throw new ForbiddenException('Este recojo no pertenece a tu cuenta');
    }
    if (recojo.estado === EstadoRecojo.FINALIZADO) {
      throw new ConflictException('Este recojo ya fue finalizado');
    }

    const horaFin = new Date();
    const tiempoTranscurridoMin = Math.round(
      (horaFin.getTime() - new Date(recojo.horaInicio).getTime()) / 60000,
    );

    recojo.horaFin = horaFin;
    recojo.tiempoTranscurridoMin = tiempoTranscurridoMin;
    recojo.estado = EstadoRecojo.FINALIZADO;
    await this.recojosRepo.save(recojo);

    return { id: recojo.id, tiempoTranscurridoMin };
  }

  async obtenerVehiculoActivo(
    usuarioId: number,
  ): Promise<{ recojoId: number; vehiculoId: number } | null> {
    const recojo = await this.recojosRepo.findOne({
      where: {
        estado: EstadoRecojo.EN_CURSO,
        programacion: { conductor: { usuario: { id: usuarioId } } },
      },
    });
    if (!recojo?.programacion.vehiculo) return null;
    return { recojoId: recojo.id, vehiculoId: recojo.programacion.vehiculo.id };
  }

  async listar() {
    const recojos = await this.recojosRepo.find({ order: { id: 'DESC' } });

    return recojos.map((recojo) => ({
      id: recojo.id,
      conductor: recojo.programacion?.conductor?.nombre || null,
      zona: recojo.programacion?.horario?.zona?.nombre || null,
      turno: recojo.programacion?.horario?.turno || null,
      vehiculo: recojo.programacion?.vehiculo?.placa || null,
      horaInicio: recojo.horaInicio,
      horaFin: recojo.horaFin || null,
      tiempoTranscurridoMin: recojo.tiempoTranscurridoMin ?? null,
      estado: recojo.estado,
    }));
  }

  private capacidadEnToneladas(capacidad?: string | null): number {
    if (!capacidad) return 0;
    const match = capacidad.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  private esReciclable(tipoVehiculo?: string | null): boolean {
    return (tipoVehiculo || '').toLowerCase().includes('recicl');
  }

  async reportesPorZona(filtros: {
    zonaId?: number;
    desde?: string;
    hasta?: string;
  }) {
    const programaciones = await this.programacionesRepo.find();
    const recojos = await this.recojosRepo.find();

    const desde = filtros.desde ? new Date(filtros.desde) : null;
    const hasta = filtros.hasta ? new Date(filtros.hasta) : null;
    if (hasta) hasta.setHours(23, 59, 59, 999);

    type Acumulado = {
      programacionesIds: Set<number>;
      programacionesConRecojo: Set<number>;
      tiempos: number[];
      volumenReciclableTon: number;
      volumenNoReciclableTon: number;
    };

    const zonaDe = (programacion: Programacion) =>
      programacion.horario?.zona?.nombre || 'Sin zona';
    const zonaIdDe = (programacion: Programacion) =>
      programacion.horario?.zona?.id;

    const zonas = new Map<string, Acumulado>();
    const entryDe = (zona: string): Acumulado => {
      let entry = zonas.get(zona);
      if (!entry) {
        entry = {
          programacionesIds: new Set(),
          programacionesConRecojo: new Set(),
          tiempos: [],
          volumenReciclableTon: 0,
          volumenNoReciclableTon: 0,
        };
        zonas.set(zona, entry);
      }
      return entry;
    };

    const pasaFiltroZona = (programacion: Programacion) =>
      !filtros.zonaId || zonaIdDe(programacion) === filtros.zonaId;

    for (const programacion of programaciones) {
      if (!pasaFiltroZona(programacion)) continue;
      entryDe(zonaDe(programacion)).programacionesIds.add(programacion.id);
    }

    for (const recojo of recojos) {
      if (recojo.estado !== EstadoRecojo.FINALIZADO) continue;
      if (!pasaFiltroZona(recojo.programacion)) continue;

      const horaInicio = new Date(recojo.horaInicio);
      if (desde && horaInicio < desde) continue;
      if (hasta && horaInicio > hasta) continue;

      const entry = entryDe(zonaDe(recojo.programacion));
      entry.programacionesConRecojo.add(recojo.programacion.id);
      if (recojo.tiempoTranscurridoMin != null) {
        entry.tiempos.push(recojo.tiempoTranscurridoMin);
      }

      const toneladas = this.capacidadEnToneladas(
        recojo.programacion.vehiculo?.capacidad,
      );
      if (this.esReciclable(recojo.programacion.vehiculo?.tipo)) {
        entry.volumenReciclableTon += toneladas;
      } else {
        entry.volumenNoReciclableTon += toneladas;
      }
    }

    return Array.from(zonas.entries()).map(([zona, data]) => ({
      zona,
      programacionesTotal: data.programacionesIds.size,
      cumplimientoPct: data.programacionesIds.size
        ? Math.round(
            (data.programacionesConRecojo.size / data.programacionesIds.size) *
              100,
          )
        : 0,
      promedioMin: data.tiempos.length
        ? Math.round(
            data.tiempos.reduce((a, b) => a + b, 0) / data.tiempos.length,
          )
        : 0,
      cantidadRecojos: data.tiempos.length,
      volumenReciclableTon: Math.round(data.volumenReciclableTon * 10) / 10,
      volumenNoReciclableTon:
        Math.round(data.volumenNoReciclableTon * 10) / 10,
    }));
  }
}
