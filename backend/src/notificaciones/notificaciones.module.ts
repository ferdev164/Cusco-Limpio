import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesProcessor } from './notificaciones.processor';
import { TwilioService } from './twilio.service';
import { Notificacion } from './entities/notificacion.entity';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'notificaciones' }),
    TypeOrmModule.forFeature([Notificacion]),
  ],
  providers: [NotificacionesService, NotificacionesProcessor, TwilioService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}