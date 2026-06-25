import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor } from '../../usuarios/entities/conductor.entity';
import { Programacion } from '../entities/programacion.entity';
import { Vehiculo } from '../entities/vehiculo.entity';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, Programacion, Conductor])],
  controllers: [VehiculosController],
  providers: [VehiculosService],
})
export class VehiculosModule {}
