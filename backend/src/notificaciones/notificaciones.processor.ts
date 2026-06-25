import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion, EstadoNotificacion } from './entities/notificacion.entity';
import { TwilioService } from './twilio.service';

@Processor('notificaciones')
export class NotificacionesProcessor extends WorkerHost {
  private readonly logger = new Logger('NotificacionesProcessor');

  constructor(
    @InjectRepository(Notificacion) private readonly repo: Repository<Notificacion>,
    private readonly twilio: TwilioService,
  ) {
    super();
  }

  async process(job: Job<{ notificacionId: number }>) {
    const noti = await this.repo.findOneBy({ id: job.data.notificacionId });
    if (!noti) return;

    // Si Twilio falla, esto lanza error y BullMQ reintenta.
    await this.twilio.enviarWhatsapp(noti.telefono, noti.mensaje);

    noti.estado = EstadoNotificacion.ENVIADA;
    noti.fechaEnvio = new Date();
    noti.error = null;
    await this.repo.save(noti);
    this.logger.log(`Enviado a ${noti.telefono} (notificación #${noti.id})`);
  }

  // Se dispara tras cada intento fallido. Cuando ya no quedan intentos, marca fallida.
  @OnWorkerEvent('failed')
  async onFailed(job: Job<{ notificacionId: number }>, err: Error) {
    const intentos = job.opts.attempts ?? 1;
    if (job.attemptsMade >= intentos) {
      const noti = await this.repo.findOneBy({ id: job.data.notificacionId });
      if (noti) {
        noti.estado = EstadoNotificacion.FALLIDA;
        noti.error = err.message;
        await this.repo.save(noti);
        this.logger.error(`Falló definitivamente la notificación #${noti.id}: ${err.message}`);
      }
    }
  }
}