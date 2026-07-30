import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conductor } from '../../usuarios/entities/conductor.entity';
import { ActualizarConductorDto } from '../dto/actualizar-conductor.dto';
import { CrearConductorDto } from '../dto/crear-conductor.dto';

@Injectable()
export class ConductoresService {
  constructor(
    @InjectRepository(Conductor) private conductoresRepo: Repository<Conductor>,
  ) {}

  async findAll() {
    const conductores = await this.conductoresRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
    return conductores.map(({ id, nombre, disponible }) => ({
      id,
      nombre,
      disponible,
    }));
  }

  async crear(dto: CrearConductorDto) {
    const conductor = this.conductoresRepo.create({
      nombre: dto.nombre,
      licencia: dto.licencia,
      turno: dto.turno,
      disponible: true,
      activo: true,
    });
    return this.conductoresRepo.save(conductor);
  }

  async actualizar(id: number, dto: ActualizarConductorDto) {
    const conductor = await this.conductoresRepo.findOne({ where: { id } });
    if (!conductor) throw new NotFoundException('Conductor no encontrado');
    Object.assign(conductor, dto);
    return this.conductoresRepo.save(conductor);
  }

  async eliminar(id: number) {
    const conductor = await this.conductoresRepo.findOne({ where: { id } });
    if (!conductor) throw new NotFoundException('Conductor no encontrado');
    conductor.activo = false;
    await this.conductoresRepo.save(conductor);
    return { mensaje: 'Conductor eliminado' };
  }
}
