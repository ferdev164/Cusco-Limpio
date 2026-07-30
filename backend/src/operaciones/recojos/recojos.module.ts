import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor } from '../../usuarios/entities/conductor.entity';
import { Programacion } from '../entities/programacion.entity';
import { Recojo } from '../entities/recojo.entity';
import { RecojosController } from './recojos.controller';
import { RecojosService } from './recojos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recojo, Programacion, Conductor])],
  controllers: [RecojosController],
  providers: [RecojosService],
  exports: [RecojosService],
})
export class RecojosModule {}
