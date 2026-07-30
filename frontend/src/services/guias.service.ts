import { API_ORIGIN } from '../config';

const API_BASE = `${API_ORIGIN}/api/guias`;

export type CategoriaGuia = 'reciclable' | 'no_reciclable';

export type Guia = {
  id: number;
  titulo: string;
  categoria: CategoriaGuia;
  descripcion: string;
  imagenUrl: string | null;
  creadoEn: string;
};

export type GuiaInput = {
  titulo: string;
  categoria: CategoriaGuia;
  descripcion: string;
  imagenUrl?: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'Ocurrio un error');
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const guiasApi = {
  listar: () => request<Guia[]>(''),
  crear: (data: GuiaInput) =>
    request<Guia>('', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id: number, data: Partial<GuiaInput>) =>
    request<Guia>(`/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  eliminar: (id: number) =>
    request<{ mensaje: string }>(`/${id}`, { method: 'DELETE' }),
};
