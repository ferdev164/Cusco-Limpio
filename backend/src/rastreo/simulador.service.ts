import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { RastreoGateway } from './rastreo.gateway';

@Injectable()
export class SimuladorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('SimuladorService');
  private intervalo: NodeJS.Timeout;
  private indice = 0;
  private recorrido = 1; // <-- nuevo: número de vuelta del camión
  private ruta: { lat: number; lng: number }[] = [];

  constructor(private readonly gateway: RastreoGateway) {}

  onModuleInit() {
    this.ruta = this.construirRuta();
    this.intervalo = setInterval(() => this.emitirSiguiente(), 2000);
    this.logger.log(`Simulador iniciado (${this.ruta.length} puntos)`);
  }

  onModuleDestroy() {
    clearInterval(this.intervalo);
  }

  private emitirSiguiente() {
    const punto = this.ruta[this.indice];
    this.gateway.emitirPosicion({
      camionId: 1,
      lat: punto.lat,
      lng: punto.lng,
      recorridoId: this.recorrido, // <-- nuevo
      timestamp: new Date().toISOString(),
    });

    this.indice = (this.indice + 1) % this.ruta.length;
    if (this.indice === 0) this.recorrido++; // dio una vuelta: nuevo recorrido
  }

  private construirRuta() {
    const waypoints = [
      { lat: -13.517, lng: -71.9785 },
      { lat: -13.5225, lng: -71.976 },
      { lat: -13.528, lng: -71.971 },
      { lat: -13.5319, lng: -71.9675 }, // Plaza de Armas
      { lat: -13.536, lng: -71.964 },
      { lat: -13.54, lng: -71.96 },
    ];
    const pasos = 15;
    const ruta: { lat: number; lng: number }[] = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      for (let p = 0; p < pasos; p++) {
        const t = p / pasos;
        ruta.push({
          lat: a.lat + (b.lat - a.lat) * t,
          lng: a.lng + (b.lng - a.lng) * t,
        });
      }
    }
    return ruta;
  }
}