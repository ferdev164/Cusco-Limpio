import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RastreoService } from './rastreo.service';
import { PosicionCamion } from './rastreo.types';

@WebSocketGateway({ cors: { origin: '*' } })
export class RastreoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('RastreoGateway');

  constructor(private readonly rastreoService: RastreoService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
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