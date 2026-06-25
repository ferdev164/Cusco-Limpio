const API_BASE = 'http://localhost:3000/api';

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
};
