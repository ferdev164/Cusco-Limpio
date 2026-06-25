import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TwilioSDK from 'twilio';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger('TwilioService');
  private client: TwilioSDK.Twilio | null = null;
  private from: string;

  constructor(private readonly config: ConfigService) {
    const sid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const token = this.config.get<string>('TWILIO_AUTH_TOKEN');
    this.from = this.config.get<string>('TWILIO_WHATSAPP_FROM') ?? '';

    if (sid && token) {
      this.client = new TwilioSDK.Twilio(sid, token);
      this.logger.log('Twilio activo: los WhatsApp se enviarán de verdad');
    } else {
      this.logger.warn('Twilio sin credenciales -> MODO SIMULADO');
    }
  }

  async enviarWhatsapp(telefono: string, mensaje: string) {
    const to = `whatsapp:${this.normalizar(telefono)}`;

    if (!this.client) {
      this.logger.log(`[SIMULADO] ${to} :: ${mensaje}`);
      return;
    }

    await this.client.messages.create({ from: this.from, to, body: mensaje });
  }

  private normalizar(tel: string) {
    const limpio = tel.replace(/\s+/g, '');
    return limpio.startsWith('+') ? limpio : `+51${limpio}`;
  }
}