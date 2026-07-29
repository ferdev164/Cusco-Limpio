import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { AsignarVehiculoDto } from '../dto/asignar-vehiculo.dto';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { ActualizarVehiculoDto } from '../dto/actualizar-vehiculo.dto';
import { Programacion } from '../entities/programacion.entity';
import { EstadoVehiculo, Vehiculo } from '../entities/vehiculo.entity';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo) private vehiculosRepo: Repository<Vehiculo>,
    @InjectRepository(Programacion)
    private programacionesRepo: Repository<Programacion>,
  ) {}

  async findAll(estado?: EstadoVehiculo) {
    const vehiculos = await this.vehiculosRepo.find({
      where: estado ? { estado } : {},
      order: { placa: 'ASC' },
    });
    return vehiculos.map((vehiculo) => this.mapVehiculo(vehiculo));
  }

  // ── CREAR ──────────────────────────────────────────────────
  async crear(dto: CrearVehiculoDto) {
    // Verifica que la placa no exista ya
    const existente = await this.vehiculosRepo.findOne({
      where: { placa: dto.placa },
    });
    if (existente) {
      throw new ConflictException('Ya existe un vehículo con esa placa');
    }

    const vehiculo = this.vehiculosRepo.create({
      placa: dto.placa,
      tipo: dto.tipo,
      capacidad: dto.capacidad,
      km: dto.km ?? 0,
      estado: dto.estado ?? EstadoVehiculo.DISPONIBLE,
    });
    const guardado = await this.vehiculosRepo.save(vehiculo);
    return this.mapVehiculo(guardado);
  }

  // ── ACTUALIZAR ─────────────────────────────────────────────
  async actualizar(id: number, dto: ActualizarVehiculoDto) {
    const vehiculo = await this.vehiculosRepo.findOne({ where: { id } });
    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    // Si cambia la placa, verifica que no choque con otra existente
    if (dto.placa && dto.placa !== vehiculo.placa) {
      const otro = await this.vehiculosRepo.findOne({
        where: { placa: dto.placa, id: Not(id) },
      });
      if (otro) {
        throw new ConflictException('Ya existe otro vehículo con esa placa');
      }
    }

    Object.assign(vehiculo, dto); // aplica solo los campos enviados
    const guardado = await this.vehiculosRepo.save(vehiculo);
    return this.mapVehiculo(guardado);
  }

  // ── ELIMINAR ───────────────────────────────────────────────
  async eliminar(id: number) {
    const vehiculo = await this.vehiculosRepo.findOne({ where: { id } });
    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    // Protección: no eliminar si tiene una programación activa
    const programacionActiva = await this.programacionesRepo.findOne({
      where: { vehiculo: { id } },
    });
    if (programacionActiva) {
      throw new BadRequestException(
        'No se puede eliminar: el vehículo tiene una programación activa',
      );
    }

    await this.vehiculosRepo.remove(vehiculo);
    return { mensaje: 'Vehículo eliminado correctamente' };
  }

  // ── ASIGNAR (lo que ya tenías) ─────────────────────────────
  async asignar(vehiculoId: number, dto: AsignarVehiculoDto) {
    const vehiculo = await this.vehiculosRepo.findOne({
      where: { id: vehiculoId },
    });

    if (!vehiculo) {
      throw new NotFoundException('Vehiculo no encontrado');
    }
    if (vehiculo.estado !== EstadoVehiculo.DISPONIBLE) {
      throw new ConflictException('Vehiculo no disponible');
    }

    const programacion = dto.programacionId
      ? await this.programacionesRepo.findOne({
          where: { id: dto.programacionId, vehiculo: IsNull() },
        })
      : await this.programacionesRepo.findOne({
          where: { vehiculo: IsNull() },
          order: { id: 'ASC' },
        });

    if (!programacion) {
      throw new ConflictException('No hay programaciones pendientes');
    }

    vehiculo.estado = EstadoVehiculo.EN_RUTA;
    vehiculo.conductor = programacion.conductor || null;
    vehiculo.zona = programacion.horario.zona || null;
    await this.vehiculosRepo.save(vehiculo);

    programacion.vehiculo = vehiculo;
    await this.programacionesRepo.save(programacion);

    const actualizado = await this.vehiculosRepo.findOne({
      where: { id: vehiculo.id },
    });
    return this.mapVehiculo(actualizado);
  }

  private mapVehiculo(vehiculo: Vehiculo) {
    return {
      id: vehiculo.id,
      placa: vehiculo.placa,
      tipo: vehiculo.tipo,
      capacidad: vehiculo.capacidad,
      km: vehiculo.km,
      estado: vehiculo.estado,
      conductor: vehiculo.conductor?.nombre || null,
      zona: vehiculo.zona?.nombre || null,
    };
  }
}