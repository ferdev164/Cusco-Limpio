import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { Administrador } from '../usuarios/entities/administrador.entity';
import { Rol, Usuario } from '../usuarios/entities/usuario.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const usuariosRepo = dataSource.getRepository(Usuario);
  const administradoresRepo = dataSource.getRepository(Administrador);

  const correo = process.env.ADMIN_EMAIL || 'admin@cuscolimpio.com';
  const contrasena = process.env.ADMIN_PASSWORD || 'admin123';
  const nombre = process.env.ADMIN_NAME || 'Administrador';
  const telefono = process.env.ADMIN_PHONE || '999999999';
  const cargo = process.env.ADMIN_CARGO || 'Administrador del sistema';

  let usuario = await usuariosRepo.findOne({ where: { correo } });

  if (!usuario) {
    usuario = usuariosRepo.create({
      nombre,
      correo,
      contrasena: await bcrypt.hash(contrasena, 10),
      telefono,
      rol: Rol.ADMINISTRADOR,
      activo: true,
    });
    await usuariosRepo.save(usuario);
    console.log(`Usuario administrador creado: ${correo}`);
  } else {
    usuario.nombre = usuario.nombre || nombre;
    usuario.telefono = usuario.telefono || telefono;
    usuario.rol = Rol.ADMINISTRADOR;
    usuario.activo = true;
    await usuariosRepo.save(usuario);
    console.log(`Usuario existente actualizado como administrador: ${correo}`);
  }

  const administradorExiste = await administradoresRepo.findOne({
    where: { usuario: { id: usuario.id } },
  });

  if (!administradorExiste) {
    const administrador = administradoresRepo.create({ usuario, cargo });
    await administradoresRepo.save(administrador);
    console.log('Perfil de administrador creado.');
  } else {
    console.log('El perfil de administrador ya existia.');
  }

  console.log('Credenciales de acceso:');
  console.log(`Correo: ${correo}`);
  console.log(`Contrasena: ${contrasena}`);

  await app.close();
}

bootstrap().catch((error) => {
  console.error('No se pudo ejecutar la seed de administrador.');
  console.error(error);
  process.exit(1);
});
