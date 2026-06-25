import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ruta } from '../entities/ruta.entity';

@Injectable()
export class RutasService {
  constructor(@InjectRepository(Ruta) private rutasRepo: Repository<Ruta>) {}

  async findAll() {
    const rutas = await this.rutasRepo.find({ order: { nombre: 'ASC' } });
    return rutas.map((ruta) => ({
      id: ruta.id,
      nombre: ruta.nombre,
      descripcion: ruta.descripcion,
      distancia_km:
        ruta.distanciaKm === null || ruta.distanciaKm === undefined
          ? null
          : Number(ruta.distanciaKm),
      tiempo_estimado_min: ruta.tiempoEstimadoMin,
      zona: ruta.zona?.nombre || null,
    }));
  }
}
