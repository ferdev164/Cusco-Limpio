import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Horario } from '../entities/horario.entity';
import { Zona } from '../entities/zona.entity';
import { HorariosController } from './horarios.controller';
import { HorariosService } from './horarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Horario, Zona])],
  controllers: [HorariosController],
  providers: [HorariosService],
})
export class HorariosModule {}
