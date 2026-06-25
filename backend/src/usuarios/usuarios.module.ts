import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrador } from './entities/administrador.entity';
import { Ciudadano } from './entities/ciudadano.entity';
import { Conductor } from './entities/conductor.entity';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Ciudadano, Administrador, Conductor])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
