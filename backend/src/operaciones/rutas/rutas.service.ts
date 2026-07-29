import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ruta } from '../entities/ruta.entity';
import { Zona } from '../entities/zona.entity';
import { CrearRutaDto } from '../dto/crear-ruta.dto';
import { ActualizarRutaDto } from '../dto/actualizar-ruta.dto';

@Injectable()
export class RutasService {
  constructor(
    @InjectRepository(Ruta) private rutasRepo: Repository<Ruta>,
    @InjectRepository(Zona) private zonasRepo: Repository<Zona>,
  ) {}

  async findAll() {
    const rutas = await this.rutasRepo.find({ order: { nombre: 'ASC' } });
    return rutas.map((ruta) => this.mapRuta(ruta));
  }

  async crear(dto: CrearRutaDto) {
    const ruta = this.rutasRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      distanciaKm: dto.distanciaKm,
      tiempoEstimadoMin: dto.tiempoEstimadoMin,
    });

    // Si envían zonaId, buscamos y asociamos la zona
    if (dto.zonaId) {
      const zona = await this.zonasRepo.findOne({ where: { id: dto.zonaId } });
      if (!zona) throw new NotFoundException('Zona no encontrada');
      ruta.zona = zona;
    }

    const guardada = await this.rutasRepo.save(ruta);
    return this.mapRuta(guardada);
  }

  async actualizar(id: number, dto: ActualizarRutaDto) {
    const ruta = await this.rutasRepo.findOne({ where: { id } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    // Actualiza la zona si viene en el DTO
    if (dto.zonaId !== undefined) {
      const zona = await this.zonasRepo.findOne({ where: { id: dto.zonaId } });
      if (!zona) throw new NotFoundException('Zona no encontrada');
      ruta.zona = zona;
    }

    if (dto.nombre !== undefined) ruta.nombre = dto.nombre;
    if (dto.descripcion !== undefined) ruta.descripcion = dto.descripcion;
    if (dto.distanciaKm !== undefined) ruta.distanciaKm = dto.distanciaKm;
    if (dto.tiempoEstimadoMin !== undefined) ruta.tiempoEstimadoMin = dto.tiempoEstimadoMin;

    const guardada = await this.rutasRepo.save(ruta);
    return this.mapRuta(guardada);
  }

  async eliminar(id: number) {
    const ruta = await this.rutasRepo.findOne({ where: { id } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    await this.rutasRepo.remove(ruta);
    return { mensaje: 'Ruta eliminada correctamente' };
  }

  private mapRuta(ruta: Ruta) {
    return {
      id: ruta.id,
      nombre: ruta.nombre,
      descripcion: ruta.descripcion,
      distancia_km:
        ruta.distanciaKm === null || ruta.distanciaKm === undefined
          ? null
          : Number(ruta.distanciaKm),
      tiempo_estimado_min: ruta.tiempoEstimadoMin,
      zona: ruta.zona?.nombre || null,
    };
  }
}