import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ruta } from '../entities/ruta.entity';
import { Zona } from '../entities/zona.entity';
import { RutasController } from './rutas.controller';
import { RutasService } from './rutas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ruta, Zona])],
  controllers: [RutasController],
  providers: [RutasService],
})
export class RutasModule {}