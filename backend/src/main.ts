import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitamos CORS
  app.enableCors({
    origin: '*', // En desarrollo puedes dejarlo así, o poner la URL exacta de tu frontend (ej: http://localhost:5173)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();