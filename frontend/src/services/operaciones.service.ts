import { API_ORIGIN } from '../config';

const API_BASE = `${API_ORIGIN}/api`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Error de servidor');
  }

  return response.json() as Promise<T>;
}

export type Zona = {
  id: number;
  nombre: string;
};

export type Horario = {
  id: number;
  turno: string;
  hora_inicio: string;
  hora_fin: string;
  dias: string;
};

export type PersonaOperativa = {
  id: number;
  nombre: string;
  disponible: boolean;
};

export type ConductorCuenta = {
  id: number;
  nombre: string;
  disponible: boolean;
  licencia: string | null;
  correo: string | null;
  tieneCuenta: boolean;
};

export type ConductorInput = {
  nombre: string;
  licencia?: string;
  turno?: string;
  disponible?: boolean;
};

export type CrearCuentaConductorInput = {
  correo: string;
  contrasena: string;
  telefono?: string;
};

export type ProgramacionConductor = {
  id: number;
  zona: string | null;
  turno: string | null;
  horaInicioTurno: string | null;
  horaFinTurno: string | null;
  dias: string | null;
  vehiculo: string | null;
  recojoActivo: { id: number; horaInicio: string } | null;
};

export type RecojoAdmin = {
  id: number;
  conductor: string | null;
  zona: string | null;
  turno: string | null;
  vehiculo: string | null;
  horaInicio: string;
  horaFin: string | null;
  tiempoTranscurridoMin: number | null;
  estado: 'en_curso' | 'finalizado';
};

export type ReporteZona = {
  zona: string;
  programacionesTotal: number;
  cumplimientoPct: number;
  promedioMin: number;
  cantidadRecojos: number;
  volumenReciclableTon: number;
  volumenNoReciclableTon: number;
};

export type ReporteFiltros = {
  zonaId?: number;
  desde?: string;
  hasta?: string;
};

export type Programacion = {
  id: number;
  zona: string | null;
  turno: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  dias: string | null;
  conductor: string | null;
  vehiculo: string | null;
  ayudantes: { id: number; nombre: string }[];
};

export type Vehiculo = {
  id: number;
  placa: string;
  tipo: string;
  capacidad: string | null;
  km: number | string | null;
  estado: string;
  conductor: string | null;
  zona: string | null;
};

export type Ruta = {
  id: number;
  nombre: string;
  descripcion: string | null;
  distancia_km: number | null;
  tiempo_estimado_min: number | null;
  zona: string | null;
};

export type VehiculoInput = {
  placa: string;
  tipo: string;
  capacidad?: string;
  km?: number;
  estado?: string;
};

  // Tipos de entrada (junto a los otros export type)
export type RutaInput = {
  nombre: string;
  zonaId?: number;
  descripcion?: string;
  distanciaKm?: number;
  tiempoEstimadoMin?: number;
};

export type HorarioInput = {
  zonaId: number;
  turno: string;
  horaInicio: string;
  horaFin: string;
  dias: string;
};

// Tipo Horario con zona (reemplaza tu type Horario actual)
export type HorarioAdmin = {
  id: number;
  turno: string;
  hora_inicio: string;
  hora_fin: string;
  dias: string;
  zona: string | null;
};

export const operacionesApi = {
  zonas: () => request<Zona[]>('/zonas'),
  horariosPorZona: (zonaId: number) =>
    request<Horario[]>(`/horarios/zona/${zonaId}`),
  conductores: () => request<PersonaOperativa[]>('/conductores'),
  ayudantes: () => request<PersonaOperativa[]>('/ayudantes'),
  vehiculos: () => request<Vehiculo[]>('/vehiculos'),
  programaciones: () => request<Programacion[]>('/programaciones'),
  rutas: () => request<Ruta[]>('/rutas'),
  crearProgramacion: (data: {
    horarioId: number;
    conductorId: number;
    ayudanteIds: number[];
    vehiculoId?: number;
  }) =>
    request<{ id: number }>('/programaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  asignarVehiculo: (vehiculoId: number, programacionId?: number) =>
    request<Vehiculo>(`/vehiculos/${vehiculoId}/asignar`, {
      method: 'POST',
      body: JSON.stringify({ programacionId }),
    }),
  
  crearVehiculo: (data: VehiculoInput) =>
    request<Vehiculo>('/vehiculos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizarVehiculo: (id: number, data: Partial<VehiculoInput>) =>
    request<Vehiculo>(`/vehiculos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  eliminarVehiculo: (id: number) =>
    request<{ mensaje: string }>(`/vehiculos/${id}`, {
      method: 'DELETE',
    }),


// Métodos nuevos dentro de operacionesApi = { ... }
  // Rutas
  crearRuta: (data: RutaInput) =>
    request<Ruta>('/rutas', { method: 'POST', body: JSON.stringify(data) }),
  actualizarRuta: (id: number, data: Partial<RutaInput>) =>
    request<Ruta>(`/rutas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  eliminarRuta: (id: number) =>
    request<{ mensaje: string }>(`/rutas/${id}`, { method: 'DELETE' }),

  // Cuentas de conductor
  conductoresCuentas: () => request<ConductorCuenta[]>('/usuarios/conductores'),
  crearCuentaConductor: (conductorId: number, data: CrearCuentaConductorInput) =>
    request<ConductorCuenta>(`/usuarios/conductores/${conductorId}/cuenta`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // CRUD de conductores
  crearConductor: (data: ConductorInput) =>
    request<{ id: number }>('/conductores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  actualizarConductor: (id: number, data: Partial<ConductorInput>) =>
    request<{ id: number }>(`/conductores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  eliminarConductor: (id: number) =>
    request<{ mensaje: string }>(`/conductores/${id}`, { method: 'DELETE' }),

  // Recojos (HU-07)
  misProgramaciones: () =>
    request<ProgramacionConductor[]>('/recojos/mis-programaciones'),
  iniciarRecojo: (programacionId: number) =>
    request<{ id: number; horaInicio: string }>('/recojos/iniciar', {
      method: 'POST',
      body: JSON.stringify({ programacionId }),
    }),
  finalizarRecojo: (recojoId: number) =>
    request<{ id: number; tiempoTranscurridoMin: number }>(
      `/recojos/${recojoId}/finalizar`,
      { method: 'POST' },
    ),
  recojosTodos: () => request<RecojoAdmin[]>('/recojos'),
  recojosReportes: (filtros?: ReporteFiltros) => {
    const params = new URLSearchParams();
    if (filtros?.zonaId) params.set('zonaId', String(filtros.zonaId));
    if (filtros?.desde) params.set('desde', filtros.desde);
    if (filtros?.hasta) params.set('hasta', filtros.hasta);
    const query = params.toString();
    return request<ReporteZona[]>(`/recojos/reportes${query ? `?${query}` : ''}`);
  },

  // Horarios
  horariosTodos: () => request<HorarioAdmin[]>('/horarios/todos'),
  crearHorario: (data: HorarioInput) =>
    request<HorarioAdmin>('/horarios', { method: 'POST', body: JSON.stringify(data) }),
  actualizarHorario: (id: number, data: Partial<HorarioInput>) =>
    request<HorarioAdmin>(`/horarios/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  eliminarHorario: (id: number) =>
    request<{ mensaje: string }>(`/horarios/${id}`, { method: 'DELETE' }),
};
