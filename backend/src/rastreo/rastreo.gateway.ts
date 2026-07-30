// Puerta WebSocket: recibe/emite posiciones en tiempo real

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RastreoService } from './rastreo.service';
import { RecojosService } from '../operaciones/recojos/recojos.service';
import { PosicionCamion } from './rastreo.types';
import { Rol } from '../usuarios/entities/usuario.entity';

interface AuthSocketData {
  usuarioId?: number;
  rol?: Rol;
}

// FRONTEND_URL restringe el CORS del socket al dominio real en produccion
// (puede llevar varios separados por coma); sin definir, permite cualquier
// origen para no exigir configuracion extra en desarrollo local.
const origenesPermitidos = process.env.FRONTEND_URL?.split(',').map((url) =>
  url.trim(),
);

@WebSocketGateway({ cors: { origin: origenesPermitidos?.length ? origenesPermitidos : '*' } })
export class RastreoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('RastreoGateway');

  constructor(
    private readonly rastreoService: RastreoService,
    private readonly recojosService: RecojosService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (token) {
      try {
        const payload = this.jwtService.verify(token) as {
          sub: number;
          rol: Rol;
        };
        (client.data as AuthSocketData).usuarioId = payload.sub;
        (client.data as AuthSocketData).rol = payload.rol;
      } catch {
        this.logger.warn(`Token invalido en socket ${client.id}`);
      }
    }
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('posicionConductor')
  async recibirPosicionConductor(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lat: number; lng: number },
  ) {
    const auth = client.data as AuthSocketData;
    if (auth.rol !== Rol.CONDUCTOR || !auth.usuarioId) return;
    if (typeof data?.lat !== 'number' || typeof data?.lng !== 'number') return;

    const activo = await this.recojosService.obtenerVehiculoActivo(
      auth.usuarioId,
    );
    if (!activo) return;

    this.emitirPosicion({
      camionId: activo.vehiculoId,
      lat: data.lat,
      lng: data.lng,
      recorridoId: activo.recojoId,
      timestamp: new Date().toISOString(),
    });
  }

  emitirPosicion(data: PosicionCamion) {
    // 1. Tiempo real: al mapa de todos
    this.server.emit('camionMovido', data);

    // 2. Proximidad: en segundo plano, no bloquea el broadcast
    this.rastreoService
      .revisarProximidad(data)
      .catch((e) => this.logger.error(`Error en proximidad: ${e.message}`));
  }
}
