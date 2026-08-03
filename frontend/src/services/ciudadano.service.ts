import { API_ORIGIN } from '../config';

const API_BASE = `${API_ORIGIN}/api`;

export type PerfilCiudadano = {
  nombre: string;
  correo: string;
  telefono: string | null;
  latitud: number | null;
  longitud: number | null;
};

export type AvisoRecibido = {
  id: number;
  mensaje: string;
  estado: 'pendiente' | 'enviada' | 'fallida';
  distanciaMetros: number;
  fechaCreacion: string;
  fechaEnvio: string | null;
};

async function request<T>(path: string): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'Ocurrio un error');
  }
  return response.json();
}

export const ciudadanoApi = {
  miPerfil: () => request<PerfilCiudadano>('/usuarios/ciudadano/me'),
  misAvisos: () => request<AvisoRecibido[]>('/notificaciones/mis-avisos'),
};
