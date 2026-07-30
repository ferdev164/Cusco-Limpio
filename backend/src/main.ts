import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// HTTPS local para probar GPS real desde el celular (requiere contexto seguro).
// Se activa solo si existen los certificados generados con scripts/gen-certs.sh
function httpsOptions() {
  const keyPath = path.join(__dirname, '..', '..', 'certs', 'dev-key.pem');
  const certPath = path.join(__dirname, '..', '..', 'certs', 'dev-cert.pem');
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) return undefined;
  return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
}

async function bootstrap() {
  const https = process.env.HTTPS_DEV === '1' ? httpsOptions() : undefined;
  const app = await NestFactory.create(AppModule, { httpsOptions: https });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // En produccion, FRONTEND_URL restringe el CORS al dominio real del frontend
  // (puede llevar varios separados por coma). Sin definir, permite cualquier
  // origen, para no exigir configuracion extra en desarrollo local.
  const frontendUrls = process.env.FRONTEND_URL?.split(',').map((url) =>
    url.trim(),
  );
  app.enableCors({ origin: frontendUrls?.length ? frontendUrls : true });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();