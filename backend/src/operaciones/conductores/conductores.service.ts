import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conductor } from '../../usuarios/entities/conductor.entity';

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
}
