import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Conductor } from './entities/conductor.entity';
import { Rol, Usuario } from './entities/usuario.entity';
import { CrearCuentaConductorDto } from './dto/crear-cuenta-conductor.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Conductor)
    private conductorRepo: Repository<Conductor>,
  ) {}

  async listarConductores() {
    const conductores = await this.conductorRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });

    return conductores.map((conductor) => ({
      id: conductor.id,
      nombre: conductor.nombre,
      disponible: conductor.disponible,
      licencia: conductor.licencia,
      correo: conductor.usuario?.correo ?? null,
      tieneCuenta: !!conductor.usuario,
    }));
  }

  async crearCuentaConductor(conductorId: number, dto: CrearCuentaConductorDto) {
    const conductor = await this.conductorRepo.findOne({
      where: { id: conductorId },
    });
    if (!conductor) throw new NotFoundException('Conductor no encontrado');
    if (conductor.usuario) {
      throw new ConflictException('Este conductor ya tiene una cuenta');
    }

    const correoExistente = await this.usuarioRepo.findOne({
      where: { correo: dto.correo },
    });
    if (correoExistente) {
      throw new ConflictException('El correo ya esta registrado');
    }

    const usuario = this.usuarioRepo.create({
      nombre: conductor.nombre,
      correo: dto.correo,
      contrasena: await bcrypt.hash(dto.contrasena, 10),
      telefono: dto.telefono,
      rol: Rol.CONDUCTOR,
    });
    await this.usuarioRepo.save(usuario);

    conductor.usuario = usuario;
    await this.conductorRepo.save(conductor);

    return {
      id: conductor.id,
      nombre: conductor.nombre,
      disponible: conductor.disponible,
      licencia: conductor.licencia,
      correo: usuario.correo,
      tieneCuenta: true,
    };
  }
}
