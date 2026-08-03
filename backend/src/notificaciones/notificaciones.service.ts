// Registra en BD y encola el aviso

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ciudadano } from '../usuarios/entities/ciudadano.entity';
import { Notificacion, EstadoNotificacion } from './entities/notificacion.entity';

export interface AvisoProximidad {
  ciudadanoId: number;
  telefono: string;
  nombre: string;
  distanciaMetros: number;
  recorridoId: number;
}

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectQueue('notificaciones') private readonly cola: Queue,
    @InjectRepository(Notificacion) private readonly repo: Repository<Notificacion>,
    @InjectRepository(Ciudadano) private readonly ciudadanoRepo: Repository<Ciudadano>,
  ) {}

  async misAvisos(usuarioId: number) {
    const ciudadano = await this.ciudadanoRepo.findOne({
      where: { usuario: { id: usuarioId } },
    });
    if (!ciudadano) throw new NotFoundException('Perfil de ciudadano no encontrado');

    const avisos = await this.repo.find({
      where: { ciudadanoId: ciudadano.id },
      order: { fechaCreacion: 'DESC' },
      take: 10,
    });

    return avisos.map((a) => ({
      id: a.id,
      mensaje: a.mensaje,
      estado: a.estado,
      distanciaMetros: a.distanciaMetros,
      fechaCreacion: a.fechaCreacion,
      fechaEnvio: a.fechaEnvio,
    }));
  }

  async encolarAviso(data: AvisoProximidad) {
    const mensaje =
      `🚛 Hola ${data.nombre}, el camión recolector de Cusco Limpio está a unos ` +
      `${data.distanciaMetros} m de tu vivienda. Saca tus residuos segregados ahora.`;

    // 1. Auditoría: registra la intención de envío (estado pendiente)
    const noti = await this.repo.save(
      this.repo.create({
        ciudadanoId: data.ciudadanoId,
        telefono: data.telefono,
        mensaje,
        estado: EstadoNotificacion.PENDIENTE,
        distanciaMetros: data.distanciaMetros,
        recorridoId: data.recorridoId,
      }),
    );

    // 2. Encola el envío. attempts+backoff = reintentos automáticos.
    await this.cola.add(
      'enviar-whatsapp',
      { notificacionId: noti.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }
}