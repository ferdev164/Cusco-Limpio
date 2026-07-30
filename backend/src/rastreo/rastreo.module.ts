import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RastreoGateway } from './rastreo.gateway';
import { RastreoService } from './rastreo.service';
import { Ciudadano } from '../usuarios/entities/ciudadano.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { RecojosModule } from '../operaciones/recojos/recojos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ciudadano]),
    NotificacionesModule,
    RecojosModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'cusco_limpio_secret',
    }),
  ],
  providers: [RastreoGateway, RastreoService],
})
export class RastreoModule {}
