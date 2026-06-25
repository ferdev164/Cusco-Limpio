import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Ciudadano } from '../usuarios/entities/ciudadano.entity';
import { distanciaMetros } from './utils/distancia';
import { PosicionCamion } from './rastreo.types';

import { NotificacionesService } from '../notificaciones/notificaciones.service';

const RADIO_METROS = 500; // criterio: igual o menor a 500 m

@Injectable()
export class RastreoService {
  private readonly logger = new Logger('RastreoService');

  // Anti-duplicados: por cada camión, en qué recorrido va y a quién ya avisó.
  private notificados = new Map<number, { recorrido: number; ids: Set<number> }>();

  constructor(
    @InjectRepository(Ciudadano)
    private readonly ciudadanoRepo: Repository<Ciudadano>,
    private readonly notificaciones: NotificacionesService, // <-- nuevo
  ) {}

  async revisarProximidad(pos: PosicionCamion) {
    // 1. ¿Empezó un nuevo recorrido? Entonces se reinicia el control de avisados.
    const estado = this.notificados.get(pos.camionId);
    if (!estado || estado.recorrido !== pos.recorridoId) {
      this.notificados.set(pos.camionId, {
        recorrido: pos.recorridoId,
        ids: new Set(),
      });
    }
    const yaAvisados = this.notificados.get(pos.camionId)!.ids;

    // 2. Ciudadanos que tienen vivienda marcada en el mapa.
    const ciudadanos = await this.ciudadanoRepo.find({
      where: { latitud: Not(IsNull()), longitud: Not(IsNull()) },
    });

    // 3. Distancia a cada uno; si entra al radio y no fue avisado, se marca.
    for (const c of ciudadanos) {
      const dist = distanciaMetros(
        pos.lat,
        pos.lng,
        Number(c.latitud), // las columnas decimal llegan como string
        Number(c.longitud),
      );

      if (dist <= RADIO_METROS && !yaAvisados.has(c.id)) {
        yaAvisados.add(c.id); // una sola vez por recorrido

        this.logger.warn(
          `[PROXIMIDAD] Camion #${pos.camionId} a ${Math.round(dist)} m de ` +
            `${c.usuario?.nombre ?? 'ciudadano'} (#${c.id}) -> encolando aviso`,
        );

        await this.notificaciones.encolarAviso({
          ciudadanoId: c.id,
          telefono: c.usuario?.telefono ?? '',
          nombre: c.usuario?.nombre ?? 'ciudadano',
          distanciaMetros: Math.round(dist),
          recorridoId: pos.recorridoId,
        });
      }
    }
  }
}