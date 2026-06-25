import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario, Rol } from '../usuarios/entities/usuario.entity';
import { Ciudadano } from '../usuarios/entities/ciudadano.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Ciudadano)
    private ciudadanoRepo: Repository<Ciudadano>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuarioRepo.findOne({
      where: { correo: dto.correo, activo: true },
    });

    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');
    if (usuario.rol !== dto.rol) {
      throw new UnauthorizedException('El tipo de usuario seleccionado no coincide');
    }

    const passwordValida = await bcrypt.compare(dto.contrasena, usuario.contrasena);
    if (!passwordValida) throw new UnauthorizedException('Credenciales incorrectas');

    return {
      access_token: this.generarToken(usuario),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }

  async registrar(dto: RegisterDto) {
    const existe = await this.usuarioRepo.findOne({
      where: { correo: dto.correo },
    });
    if (existe) throw new ConflictException('El correo ya está registrado');

    const hash = await bcrypt.hash(dto.contrasena, 10);

    const usuario = this.usuarioRepo.create({
      nombre: dto.nombre,
      correo: dto.correo,
      contrasena: hash,
      telefono: dto.telefono,
      rol: dto.rol || Rol.CIUDADANO,
    });
    await this.usuarioRepo.save(usuario);

    if (usuario.rol === Rol.CIUDADANO) {
      
      const ciudadano = this.ciudadanoRepo.create({
        usuario,
        latitud: dto.latitud ? Number(dto.latitud) : null,
        longitud: dto.longitud ? Number(dto.longitud) : null,
      });
      await this.ciudadanoRepo.save(ciudadano);
    }

    return {
      access_token: this.generarToken(usuario),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }

  private generarToken(usuario: Usuario) {
    return this.jwtService.sign({
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    });
  }
}
