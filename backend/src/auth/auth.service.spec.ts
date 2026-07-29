// ============================================================
// ARCHIVO: backend/src/auth/auth.service.spec.ts
// Pruebas unitarias del AuthService — login y registro
// Ejecutar: npm test (desde la carpeta backend)
// ============================================================
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Usuario, Rol } from '../usuarios/entities/usuario.entity';
import { Ciudadano } from '../usuarios/entities/ciudadano.entity';
import * as bcrypt from 'bcrypt';

// ── Mocks ────────────────────────────────────────────────────
// En pruebas unitarias NO usamos la base de datos real.
// Creamos objetos "falsos" que simulan el comportamiento del repositorio.

const usuarioMock: Partial<Usuario> = {
  id: 1,
  nombre: 'Juan Quispe',
  correo: 'juan@ejemplo.com',
  contrasena: '', // se llena en beforeEach con el hash real
  rol: Rol.CIUDADANO,
  activo: true,
};

// Simula los métodos del repositorio de TypeORM
const mockUsuarioRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockCiudadanoRepo = {
  create: jest.fn(),
  save: jest.fn(),
};

// Simula el JwtService
const mockJwtService = {
  sign: jest.fn().mockReturnValue('token.jwt.simulado'),
};

// ── Setup ────────────────────────────────────────────────────
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    // Genera el hash real de la contraseña para que bcrypt.compare funcione
    usuarioMock.contrasena = await bcrypt.hash('password123', 10);

    // Reinicia todos los mocks antes de cada prueba
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Usuario), useValue: mockUsuarioRepo },
        { provide: getRepositoryToken(Ciudadano), useValue: mockCiudadanoRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── PRUEBAS DE LOGIN ────────────────────────────────────────

  describe('login()', () => {

    it('PASSED: debería retornar access_token con credenciales correctas', async () => {
      // ARRANGE (preparar): el repositorio encuentra al usuario
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioMock);

      // ACT (actuar): llamamos al método login
      const resultado = await service.login({
        correo: 'juan@ejemplo.com',
        contrasena: 'password123',
      });

      // ASSERT (verificar): el resultado tiene la forma esperada
      expect(resultado).toHaveProperty('access_token');
      expect(resultado).toHaveProperty('usuario');
      expect(resultado.usuario.correo).toBe('juan@ejemplo.com');
      expect(resultado.usuario.rol).toBe(Rol.CIUDADANO);
    });

    it('FAILED: debería lanzar UnauthorizedException si el usuario no existe', async () => {
      // ARRANGE: el repositorio NO encuentra al usuario (correo inexistente)
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      // ASSERT: esperamos que lance el error correcto
      await expect(
        service.login({
          correo: 'noexiste@ejemplo.com',
          contrasena: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('FAILED: debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      // ARRANGE: el usuario existe pero la contraseña no coincide
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioMock);

      await expect(
        service.login({
          correo: 'juan@ejemplo.com',
          contrasena: 'contraseña_incorrecta',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('PASSED: debería identificar el rol desde la BD sin que el cliente lo indique (RBAC)', async () => {
      // ARRANGE: el usuario guardado es ADMINISTRADOR; el DTO de login no lleva rol
      mockUsuarioRepo.findOne.mockResolvedValue({
        ...usuarioMock,
        rol: Rol.ADMINISTRADOR,
      });

      const resultado = await service.login({
        correo: 'juan@ejemplo.com',
        contrasena: 'password123',
      });

      // El rol devuelto viene siempre de la BD, nunca de lo que envía el cliente
      expect(resultado.usuario.rol).toBe(Rol.ADMINISTRADOR);
    });

    it('FAILED: debería lanzar UnauthorizedException si la cuenta está inactiva', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue({ ...usuarioMock, activo: false });

      await expect(
        service.login({
          correo: 'juan@ejemplo.com',
          contrasena: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('PASSED: debería retornar el rol correcto en el resultado', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioMock);

      const resultado = await service.login({
        correo: 'juan@ejemplo.com',
        contrasena: 'password123',
      });

      expect(resultado.usuario.rol).toBe(Rol.CIUDADANO);
      expect(resultado.usuario.rol).not.toBe(Rol.ADMINISTRADOR);
    });

    it('PASSED: el token devuelto no debe estar vacío', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioMock);

      const resultado = await service.login({
        correo: 'juan@ejemplo.com',
        contrasena: 'password123',
      });

      expect(resultado.access_token).toBeTruthy();
      expect(resultado.access_token.length).toBeGreaterThan(0);
    });

  });

  // ── PRUEBAS DE REGISTRO ─────────────────────────────────────

  describe('registrar()', () => {

    it('PASSED: debería registrar un ciudadano nuevo y retornar access_token', async () => {
      // ARRANGE: el correo no está registrado
      mockUsuarioRepo.findOne.mockResolvedValue(null);
      mockUsuarioRepo.create.mockReturnValue({ ...usuarioMock, id: 2 });
      mockUsuarioRepo.save.mockResolvedValue({ ...usuarioMock, id: 2 });
      mockCiudadanoRepo.create.mockReturnValue({});
      mockCiudadanoRepo.save.mockResolvedValue({});

      // ACT
      const resultado = await service.registrar({
        nombre: 'María Condori',
        correo: 'maria@ejemplo.com',
        contrasena: 'clave456',
        telefono: '987654321',
        rol: Rol.CIUDADANO,
        latitud: -13.5319,
        longitud: -71.9675,
      });

      // ASSERT
      expect(resultado).toHaveProperty('access_token');
      expect(resultado.usuario.nombre).toBe('Juan Quispe'); // viene del mock
      // Verifica que se guardó el ciudadano (con su ubicación)
      expect(mockCiudadanoRepo.save).toHaveBeenCalledTimes(1);
    });

    it('FAILED: debería lanzar ConflictException si el correo ya está registrado', async () => {
      // ARRANGE: el repositorio encuentra que el correo YA existe
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioMock);

      await expect(
        service.registrar({
          nombre: 'Otro Usuario',
          correo: 'juan@ejemplo.com', // correo duplicado
          contrasena: 'clave789',
          rol: Rol.CIUDADANO,
        }),
      ).rejects.toThrow(ConflictException);

      // Verifica que NUNCA se intentó guardar (no llegó al save)
      expect(mockUsuarioRepo.save).not.toHaveBeenCalled();
    });

    it('PASSED: la contraseña debe guardarse hasheada (no en texto plano)', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      let contrasenaGuardada = '';
      mockUsuarioRepo.create.mockImplementation((data) => {
        contrasenaGuardada = data.contrasena; // capturamos lo que se va a guardar
        return { ...data, id: 3 };
      });
      mockUsuarioRepo.save.mockImplementation((u) => Promise.resolve(u));
      mockCiudadanoRepo.create.mockReturnValue({});
      mockCiudadanoRepo.save.mockResolvedValue({});

      await service.registrar({
        nombre: 'Pedro Huanca',
        correo: 'pedro@ejemplo.com',
        contrasena: 'miClave123',
        rol: Rol.CIUDADANO,
      });

      // La contraseña guardada NO debe ser igual al texto original
      expect(contrasenaGuardada).not.toBe('miClave123');
      // Y debe ser un hash válido de bcrypt (empieza con $2b$)
      expect(contrasenaGuardada).toMatch(/^\$2b\$/);
    });

    it('FAILED: debería lanzar error si el nombre está vacío', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      await expect(
        service.registrar({
          nombre: '',
          correo: 'nuevo@ejemplo.com',
          contrasena: 'clave123',
          rol: Rol.CIUDADANO,
        }),
      ).rejects.toThrow();
    });

    it('PASSED: debería llamar a save exactamente una vez al registrar', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);
      mockUsuarioRepo.create.mockReturnValue({ ...usuarioMock });
      mockUsuarioRepo.save.mockResolvedValue({ ...usuarioMock });
      mockCiudadanoRepo.create.mockReturnValue({});
      mockCiudadanoRepo.save.mockResolvedValue({});

      await service.registrar({
        nombre: 'Luis Mamani',
        correo: 'luis@ejemplo.com',
        contrasena: 'clave123',
        rol: Rol.CIUDADANO,
      });

      expect(mockUsuarioRepo.save).toHaveBeenCalledTimes(1);
    });

    it('PASSED: la contraseña hasheada debe poder verificarse con bcrypt', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      let hashGuardado = '';
      mockUsuarioRepo.create.mockImplementation((data) => {
        hashGuardado = data.contrasena;
        return { ...data, id: 4 };
      });
      mockUsuarioRepo.save.mockImplementation((u) => Promise.resolve(u));
      mockCiudadanoRepo.create.mockReturnValue({});
      mockCiudadanoRepo.save.mockResolvedValue({});

      await service.registrar({
        nombre: 'Ana Quispe',
        correo: 'ana@ejemplo.com',
        contrasena: 'miClave456',
        rol: Rol.CIUDADANO,
      });

      // Verifica que el hash corresponde a la contraseña original
      const esValido = await bcrypt.compare('miClave456', hashGuardado);
      expect(esValido).toBe(true);
    });

  });

});