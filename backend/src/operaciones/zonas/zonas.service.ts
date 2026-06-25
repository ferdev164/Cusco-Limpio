import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zona } from '../entities/zona.entity';

@Injectable()
export class ZonasService {
  constructor(@InjectRepository(Zona) private zonasRepo: Repository<Zona>) {}

  async findAll() {
    const zonas = await this.zonasRepo.find({ order: { nombre: 'ASC' } });
    return zonas.map((zona) => ({ id: zona.id, nombre: zona.nombre }));
  }
}
