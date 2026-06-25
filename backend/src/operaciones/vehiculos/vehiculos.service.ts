import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AsignarVehiculoDto } from '../dto/asignar-vehiculo.dto';
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
