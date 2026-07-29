import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Horario } from '../entities/horario.entity';
import { Zona } from '../entities/zona.entity';
import { CrearHorarioDto } from '../dto/crear-horario.dto';
import { ActualizarHorarioDto } from '../dto/actualizar-horario.dto';

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(Horario) private horariosRepo: Repository<Horario>,
    @InjectRepository(Zona) private zonasRepo: Repository<Zona>,
  ) {}

  async findByZonaId(zonaId: number) {
    const horarios = await this.horariosRepo.find({
      where: { zona: { id: zonaId } },
      order: { horaInicio: 'ASC' },
    });
    return horarios.map((horario) => this.mapHorario(horario));
  }

  async searchByZona(zona: string) {
    const horarios = await this.horariosRepo
      .createQueryBuilder('horario')
      .innerJoinAndSelect('horario.zona', 'zona')
      .where('LOWER(zona.nombre) LIKE LOWER(:zona)', { zona: `%${zona}%` })
      .orderBy('horario.horaInicio', 'ASC')
      .getMany();

    if (horarios.length === 0) {
      throw new NotFoundException('Zona no encontrada');
    }

    return horarios.map((horario) => ({
      turno: horario.turno,
      hora_inicio: horario.horaInicio,
      hora_fin: horario.horaFin,
      dias: horario.dias,
    }));
  }

  async findZonas() {
    const zonas = await this.zonasRepo.find({ order: { nombre: 'ASC' } });
    return zonas.map((zona) => ({ id: zona.id, nombre: zona.nombre }));
  }

  // ── CREAR ──────────────────────────────────────────────────
  async crear(dto: CrearHorarioDto) {
    const zona = await this.zonasRepo.findOne({ where: { id: dto.zonaId } });
    if (!zona) throw new NotFoundException('Zona no encontrada');

    const horario = this.horariosRepo.create({
      zona,
      turno: dto.turno,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      dias: dto.dias,
    });
    const guardado = await this.horariosRepo.save(horario);
    return this.mapHorario(guardado);
  }

  // ── ACTUALIZAR ─────────────────────────────────────────────
  async actualizar(id: number, dto: ActualizarHorarioDto) {
    const horario = await this.horariosRepo.findOne({ where: { id } });
    if (!horario) throw new NotFoundException('Horario no encontrado');

    if (dto.zonaId !== undefined) {
      const zona = await this.zonasRepo.findOne({ where: { id: dto.zonaId } });
      if (!zona) throw new NotFoundException('Zona no encontrada');
      horario.zona = zona;
    }

    if (dto.turno !== undefined) horario.turno = dto.turno;
    if (dto.horaInicio !== undefined) horario.horaInicio = dto.horaInicio;
    if (dto.horaFin !== undefined) horario.horaFin = dto.horaFin;
    if (dto.dias !== undefined) horario.dias = dto.dias;

    const guardado = await this.horariosRepo.save(horario);
    return this.mapHorario(guardado);
  }

  // ── ELIMINAR ───────────────────────────────────────────────
  async eliminar(id: number) {
    const horario = await this.horariosRepo.findOne({ where: { id } });
    if (!horario) throw new NotFoundException('Horario no encontrado');

    await this.horariosRepo.remove(horario);
    return { mensaje: 'Horario eliminado correctamente' };
  }

  private mapHorario(horario: Horario) {
    return {
      id: horario.id,
      turno: horario.turno,
      hora_inicio: horario.horaInicio,
      hora_fin: horario.horaFin,
      dias: horario.dias,
      zona: horario.zona?.nombre || null,
    };
  }
  async findAll() {
    const horarios = await this.horariosRepo.find({
      order: { id: 'ASC' },
    });
    return horarios.map((horario) => this.mapHorario(horario));
  }
}