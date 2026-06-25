import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000',
});

export type RolUsuario = 'administrador' | 'ciudadano' | 'conductor';
export type RolLogin = Extract<RolUsuario, 'administrador' | 'ciudadano'>;

export interface LoginData {
  correo: string;
  contrasena: string;
  rol: RolLogin;
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
