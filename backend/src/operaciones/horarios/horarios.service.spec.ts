import { Test, TestingModule } from '@nestjs/testing';
import { HorariosService } from './horarios.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Horario } from '../entities/horario.entity';
import { Zona } from '../entities/zona.entity';

// ── Mocks ────────────────────────────────────────────────────
const zonaMock: Partial<Zona> = { id: 1, nombre: 'Centro Histórico' };

const horarioMock: Partial<Horario> = {
  id: 1,
  turno: 'Mañana',
  horaInicio: '07:00',
  horaFin: '09:00',
  dias: 'Lunes,Miércoles,Viernes',
  zona: zonaMock as Zona,
};

const mockHorariosRepo = {
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockZonasRepo = {
  find: jest.fn(),
};

// ── Setup ────────────────────────────────────────────────────
describe('HorariosService', () => {
  let service: HorariosService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HorariosService,
        { provide: getRepositoryToken(Horario), useValue: mockHorariosRepo },
        { provide: getRepositoryToken(Zona), useValue: mockZonasRepo },
      ],
    }).compile();

    service = module.get<HorariosService>(HorariosService);
  });

  // ── findByZonaId ─────────────────────────────────────────

  describe('findByZonaId()', () => {

    it('PASSED: debería retornar horarios de una zona existente', async () => {
      mockHorariosRepo.find.mockResolvedValue([horarioMock]);

      const resultado = await service.findByZonaId(1);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].turno).toBe('Mañana');
      expect(resultado[0].hora_inicio).toBe('07:00');
    });

    it('PASSED: debería retornar arreglo vacío si la zona no tiene horarios', async () => {
      mockHorariosRepo.find.mockResolvedValue([]);

      const resultado = await service.findByZonaId(99);

      expect(resultado).toHaveLength(0);
      expect(Array.isArray(resultado)).toBe(true);
    });

  });

  // ── searchByZona ──────────────────────────────────────────

  describe('searchByZona()', () => {

    it('PASSED: debería encontrar horarios buscando por nombre de zona', async () => {
      const qbMock = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([horarioMock]),
      };
      mockHorariosRepo.createQueryBuilder.mockReturnValue(qbMock);

      const resultado = await service.searchByZona('Centro');

      expect(resultado).toHaveLength(1);
      expect(resultado[0].turno).toBe('Mañana');
      expect(resultado[0].dias).toBe('Lunes,Miércoles,Viernes');
    });

    it('FAILED: debería lanzar NotFoundException si la zona no existe', async () => {
      const qbMock = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]), // zona no encontrada
      };
      mockHorariosRepo.createQueryBuilder.mockReturnValue(qbMock);

      await expect(service.searchByZona('ZonaInexistente'))
        .rejects.toThrow(NotFoundException);
    });

  });

  // ── findZonas ─────────────────────────────────────────────

  describe('findZonas()', () => {

    it('PASSED: debería retornar la lista de zonas disponibles', async () => {
      mockZonasRepo.find.mockResolvedValue([zonaMock]);

      const resultado = await service.findZonas();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nombre).toBe('Centro Histórico');
      expect(resultado[0]).toHaveProperty('id');
    });

    it('PASSED: debería retornar arreglo vacío si no hay zonas', async () => {
      mockZonasRepo.find.mockResolvedValue([]);

      const resultado = await service.findZonas();

      expect(resultado).toHaveLength(0);
    });

  });

});