import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { OperacionesModule } from './operaciones/operaciones.module';
import { RastreoModule } from './rastreo/rastreo.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { GuiasModule } from './guias/guias.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT')!, 10),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        // Necesario para conectarse a Postgres desde fuera de la red interna
        // de Render (ej. al correr el seed desde tu propia computadora).
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    // NUEVO: conecta BullMQ a Redis/Memurai
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST') ?? 'localhost',
          port: parseInt(config.get<string>('REDIS_PORT') ?? '6379', 10),
        },
      }),
    }),

    UsuariosModule,
    AuthModule,
    OperacionesModule,
    RastreoModule,
    NotificacionesModule, // registrado globalmente
    GuiasModule,
  ],
})
export class AppModule {}