import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RastreoGateway } from './rastreo.gateway';
import { SimuladorService } from './simulador.service';
import { RastreoService } from './rastreo.service';
import { Ciudadano } from '../usuarios/entities/ciudadano.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ciudadano]),
    NotificacionesModule, // <-- nuevo
  ],
  providers: [RastreoGateway, SimuladorService, RastreoService],
})
export class RastreoModule {}