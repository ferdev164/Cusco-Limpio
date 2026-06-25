import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 1. Carga el archivo .env de forma global
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Configura la conexión usando las variables de entorno
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
        autoLoadEntities: true, // Esto cargará automáticamente tus entidades (tablas)
        synchronize: true, // ¡Solo en desarrollo! Crea las tablas automáticamente
      }),
    }),

    UsuariosModule,

    AuthModule,
  ],
})
export class AppModule {}