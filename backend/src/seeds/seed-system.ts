import { NestFactory } from '@nestjs/core';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { Ayudante } from '../operaciones/entities/ayudante.entity';
import { Horario } from '../operaciones/entities/horario.entity';
import { Programacion } from '../operaciones/entities/programacion.entity';
import { Ruta } from '../operaciones/entities/ruta.entity';
import {
  EstadoVehiculo,
  Vehiculo,
} from '../operaciones/entities/vehiculo.entity';
import { Zona } from '../operaciones/entities/zona.entity';
import { Administrador } from '../usuarios/entities/administrador.entity';
import { Conductor } from '../usuarios/entities/conductor.entity';
import { Rol, Usuario } from '../usuarios/entities/usuario.entity';

async function seedAdmin(dataSource: DataSource) {
  const usuariosRepo = dataSource.getRepository(Usuario);
  const administradoresRepo = dataSource.getRepository(Administrador);

  const correo = process.env.ADMIN_EMAIL || 'admin@cuscolimpio.com';
  const contrasena = process.env.ADMIN_PASSWORD || 'admin123';

  let usuario = await usuariosRepo.findOne({ where: { correo } });

  if (!usuario) {
    usuario = usuariosRepo.create({
      nombre: process.env.ADMIN_NAME || 'Administrador',
      correo,
      contrasena: await bcrypt.hash(contrasena, 10),
      telefono: process.env.ADMIN_PHONE || '999999999',
      rol: Rol.ADMINISTRADOR,
      activo: true,
    });
    await usuariosRepo.save(usuario);
  } else {
    usuario.rol = Rol.ADMINISTRADOR;
    usuario.activo = true;
    await usuariosRepo.save(usuario);
  }

  const existePerfil = await administradoresRepo.findOne({
    where: { usuario: { id: usuario.id } },
  });

  if (!existePerfil) {
    await administradoresRepo.save(
      administradoresRepo.create({
        usuario,
        cargo: process.env.ADMIN_CARGO || 'Administrador del sistema',
      }),
    );
  }

  return { correo, contrasena };
}

async function findOrCreateZona(repo: Repository<Zona>, nombre: string) {
  let zona = await repo.findOne({ where: { nombre } });
  if (!zona) {
    zona = await repo.save(repo.create({ nombre }));
  }
  return zona;
}

async function seedZonas(zonasRepo: Repository<Zona>) {
  const nombres = [
    'San Blas',
    'Centro Historico',
    'San Cristobal',
    'Ccari Grande',
    'Los Incas',
    'Magisterio',
    'Zaguan del Cielo',
    'San Pedro',
    'Santa Ana',
  ];

  const zonas = new Map<string, Zona>();
  for (const nombre of nombres) {
    zonas.set(nombre, await findOrCreateZona(zonasRepo, nombre));
  }
  return zonas;
}

async function seedHorarios(
  horariosRepo: Repository<Horario>,
  zonas: Map<string, Zona>,
) {
  const horarios = [
    ['San Blas', 'Manana', '06:00', '07:00', 'Todos los dias'],
    ['San Blas', 'Noche', '20:00', '21:00', 'Todos los dias'],
    ['Centro Historico', 'Madrugada', '05:00', '06:00', 'Todos los dias'],
    ['Centro Historico', 'Noche', '22:00', '23:00', 'Todos los dias'],
    ['San Cristobal', 'Manana', '06:30', '07:15', 'Lun, Dom'],
    ['Ccari Grande', 'Tarde', '14:30', '15:00', 'Mar, Jue, Sab'],
    ['Los Incas', 'Tarde', '15:00', '16:00', 'Mar, Jue, Sab'],
    ['Magisterio', 'Tarde', '15:40', '17:00', 'Mar, Jue, Sab'],
    ['Zaguan del Cielo', 'Manana', '07:15', '08:00', 'Mar, Jue, Sab'],
    ['San Pedro', 'Tarde', '15:00', '17:00', 'Todos los dias'],
    ['Santa Ana', 'Tarde', '12:10', '16:00', 'Lun, Mie, Vie'],
  ];

  for (const [zonaNombre, turno, horaInicio, horaFin, dias] of horarios) {
    const zona = zonas.get(zonaNombre);
    if (!zona) continue;

    const existe = await horariosRepo.findOne({
      where: {
        zona: { id: zona.id },
        turno,
        horaInicio,
        horaFin,
      },
    });

    if (!existe) {
      await horariosRepo.save(
        horariosRepo.create({
          zona,
          turno,
          horaInicio,
          horaFin,
          dias,
        }),
      );
    }
  }
}

async function seedConductores(conductoresRepo: Repository<Conductor>) {
  const conductores = [
    { nombre: 'Maria Garcia', disponible: true, licencia: 'AII-B-001' },
    { nombre: 'Carlos Mendoza', disponible: true, licencia: 'AII-B-002' },
    { nombre: 'Juan Lopez', disponible: false, licencia: 'AII-B-003' },
    { nombre: 'Ana Quispe', disponible: true, licencia: 'AII-B-004' },
  ];

  for (const data of conductores) {
    const existe = await conductoresRepo.findOne({
      where: { nombre: data.nombre },
    });
    if (!existe) {
      await conductoresRepo.save(
        conductoresRepo.create({ ...data, activo: true }),
      );
    }
  }
}

async function seedAyudantes(ayudantesRepo: Repository<Ayudante>) {
  const ayudantes = [
    { nombre: 'Rosa Huaman', disponible: true },
    { nombre: 'Luis Flores', disponible: true },
    { nombre: 'Diego Quispe', disponible: true },
    { nombre: 'Sofia Ramos', disponible: false },
  ];

  for (const data of ayudantes) {
    const existe = await ayudantesRepo.findOne({ where: { nombre: data.nombre } });
    if (!existe) {
      await ayudantesRepo.save(ayudantesRepo.create({ ...data, activo: true }));
    }
  }
}

async function seedVehiculos(
  vehiculosRepo: Repository<Vehiculo>,
  zonas: Map<string, Zona>,
) {
  const vehiculos = [
    ['GBC-153', 'Compactador', '12 ton', 45230, EstadoVehiculo.DISPONIBLE],
    ['DEF-456', 'Compactador', '12 ton', 52430, EstadoVehiculo.EN_RUTA],
    ['DEF-476', 'Reciclador', '8 ton', 78900, EstadoVehiculo.MANTENIMIENTO],
    ['JKL-012', 'Compactador', '12 ton', 32100, EstadoVehiculo.DISPONIBLE],
    ['DEF-486', 'Reciclador', '8 ton', 78900, EstadoVehiculo.FUERA_SERVICIO],
    ['FBC-113', 'Compactador', '12 ton', 45230, EstadoVehiculo.DISPONIBLE],
    ['JKL-042', 'Compactador', '12 ton', 32100, EstadoVehiculo.DISPONIBLE],
  ] as const;

  for (const [placa, tipo, capacidad, km, estado] of vehiculos) {
    const existe = await vehiculosRepo.findOne({ where: { placa } });
    if (!existe) {
      await vehiculosRepo.save(
        vehiculosRepo.create({
          placa,
          tipo,
          capacidad,
          km,
          estado,
          zona: zonas.get('San Blas'),
        }),
      );
    }
  }
}

async function seedRutas(rutasRepo: Repository<Ruta>, zonas: Map<string, Zona>) {
  const rutas = [
    ['Ruta San Blas', 'San Blas', 'Circuito principal', 5.2, 35],
    ['Ruta Centro Historico', 'Centro Historico', 'Centro urbano', 6.8, 45],
    ['Ruta San Pedro', 'San Pedro', 'Mercado y alrededores', 5.0, 40],
  ] as const;

  for (const [nombre, zonaNombre, descripcion, distanciaKm, tiempoEstimadoMin] of rutas) {
    const existe = await rutasRepo.findOne({ where: { nombre } });
    if (!existe) {
      await rutasRepo.save(
        rutasRepo.create({
          nombre,
          zona: zonas.get(zonaNombre),
          descripcion,
          distanciaKm,
          tiempoEstimadoMin,
        }),
      );
    }
  }
}

async function seedProgramaciones(dataSource: DataSource) {
  const horariosRepo = dataSource.getRepository(Horario);
  const conductoresRepo = dataSource.getRepository(Conductor);
  const ayudantesRepo = dataSource.getRepository(Ayudante);
  const programacionesRepo = dataSource.getRepository(Programacion);

  const horarios = await horariosRepo.find({ order: { id: 'ASC' } });
  const maria = await conductoresRepo.findOne({ where: { nombre: 'Maria Garcia' } });
  const carlos = await conductoresRepo.findOne({ where: { nombre: 'Carlos Mendoza' } });
  const ayudantes = await ayudantesRepo.find({
    where: [{ nombre: 'Rosa Huaman' }, { nombre: 'Luis Flores' }],
  });

  const semillas = [
    { horario: horarios[0], conductor: maria, ayudantes },
    { horario: horarios[1], conductor: carlos, ayudantes: ayudantes.slice(0, 1) },
  ];

  for (const semilla of semillas) {
    if (!semilla.horario || !semilla.conductor) continue;

    const existentes = await programacionesRepo.find();
    const existe = existentes.some(
      (programacion) =>
        programacion.horario?.id === semilla.horario.id &&
        programacion.conductor?.id === semilla.conductor.id,
    );

    if (!existe) {
      await programacionesRepo.save(programacionesRepo.create(semilla));
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const admin = await seedAdmin(dataSource);
  const zonas = await seedZonas(dataSource.getRepository(Zona));

  await seedHorarios(dataSource.getRepository(Horario), zonas);
  await seedConductores(dataSource.getRepository(Conductor));
  await seedAyudantes(dataSource.getRepository(Ayudante));
  await seedVehiculos(dataSource.getRepository(Vehiculo), zonas);
  await seedRutas(dataSource.getRepository(Ruta), zonas);
  await seedProgramaciones(dataSource);

  console.log('Seed del sistema completada.');
  console.log(`Admin: ${admin.correo}`);
  console.log(`Contrasena: ${admin.contrasena}`);

  await app.close();
}

bootstrap().catch((error) => {
  console.error('No se pudo ejecutar la seed del sistema.');
  console.error(error);
  process.exit(1);
});
