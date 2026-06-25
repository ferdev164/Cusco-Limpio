import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor } from '../../usuarios/entities/conductor.entity';
import { Ayudante } from '../entities/ayudante.entity';
import { Horario } from '../entities/horario.entity';
import { Programacion } from '../entities/programacion.entity';
import { ProgramacionesController } from './programaciones.controller';
import { ProgramacionesService } from './programaciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([Programacion, Horario, Conductor, Ayudante])],
  controllers: [ProgramacionesController],
  providers: [ProgramacionesService],
})
export class ProgramacionesModule {}
