import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ayudante } from '../entities/ayudante.entity';

@Injectable()
export class AyudantesService {
  constructor(
    @InjectRepository(Ayudante) private ayudantesRepo: Repository<Ayudante>,
  ) {}

  async findAll() {
    const ayudantes = await this.ayudantesRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
    return ayudantes.map(({ id, nombre, disponible }) => ({
      id,
      nombre,
      disponible,
    }));
  }
}
