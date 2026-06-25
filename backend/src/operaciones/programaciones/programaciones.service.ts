import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Conductor } from '../../usuarios/entities/conductor.entity';
import { CrearProgramacionDto } from '../dto/crear-programacion.dto';
import { Ayudante } from '../entities/ayudante.entity';
import { Horario } from '../entities/horario.entity';
import { Programacion } from '../entities/programacion.entity';

@Injectable()
export class ProgramacionesService {
  constructor(
    @InjectRepository(Programacion)
    private programacionesRepo: Repository<Programacion>,
    @InjectRepository(Horario) private horariosRepo: Repository<Horario>,
    @InjectRepository(Conductor) private conductoresRepo: Repository<Conductor>,
    @InjectRepository(Ayudante) private ayudantesRepo: Repository<Ayudante>,
  ) {}

  async findAll(zonaId?: number) {
    const programaciones = await this.programacionesRepo.find({
      order: { id: 'DESC' },
    });

    return programaciones
      .filter((programacion) =>
        zonaId ? programacion.horario?.zona?.id === zonaId : true,
      )
      .map((programacion) => this.mapProgramacion(programacion));
  }

  async create(dto: CrearProgramacionDto) {
    const horario = await this.horariosRepo.findOne({
      where: { id: dto.horarioId },
    });
    if (!horario) {
      throw new NotFoundException('Horario no encontrado');
    }

    const conductor = await this.conductoresRepo.findOne({
      where: { id: dto.conductorId },
    });
    if (!conductor) {
      throw new NotFoundException('Conductor no encontrado');
    }
    if (!conductor.disponible) {
      throw new ConflictException('Conductor no disponible');
    }

    const ayudanteIds = [...new Set(dto.ayudanteIds || [])];
    const ayudantes = ayudanteIds.length
      ? await this.ayudantesRepo.find({ where: { id: In(ayudanteIds) } })
      : [];

    if (ayudantes.length !== ayudanteIds.length) {
      throw new NotFoundException('Ayudante no encontrado');
    }
    if (ayudantes.some((ayudante) => !ayudante.disponible)) {
      throw new ConflictException('Ayudante no disponible');
    }

    const programacion = this.programacionesRepo.create({
      horario,
      conductor,
      ayudantes,
    });
    const guardada = await this.programacionesRepo.save(programacion);

    return { id: guardada.id };
  }

  private mapProgramacion(programacion: Programacion) {
    return {
      id: programacion.id,
      zona: programacion.horario?.zona?.nombre || null,
      turno: programacion.horario?.turno || null,
      hora_inicio: programacion.horario?.horaInicio || null,
      hora_fin: programacion.horario?.horaFin || null,
      dias: programacion.horario?.dias || null,
      conductor: programacion.conductor?.nombre || null,
      vehiculo: programacion.vehiculo?.placa || null,
      ayudantes: (programacion.ayudantes || []).map((ayudante) => ({
        id: ayudante.id,
        nombre: ayudante.nombre,
      })),
    };
  }
}
