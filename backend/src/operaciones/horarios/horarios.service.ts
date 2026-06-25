import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Horario } from '../entities/horario.entity';
import { Zona } from '../entities/zona.entity';

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

  private mapHorario(horario: Horario) {
    return {
      id: horario.id,
      turno: horario.turno,
      hora_inicio: horario.horaInicio,
      hora_fin: horario.horaFin,
      dias: horario.dias,
    };
  }
}
