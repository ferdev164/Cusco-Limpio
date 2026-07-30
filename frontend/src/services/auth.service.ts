import axios from 'axios';
import { API_ORIGIN } from '../config';

const API = axios.create({
  baseURL: API_ORIGIN,
});

export type RolUsuario = 'administrador' | 'ciudadano' | 'conductor';

export interface LoginData {
  correo: string;
  contrasena: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

export interface AuthResponse {
  access_token: string;
  usuario: Usuario;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>('/auth/login', data);
  return response.data;
};
