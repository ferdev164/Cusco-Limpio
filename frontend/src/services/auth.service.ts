import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000',
});

export interface LoginData {
  correo: string;
  contrasena: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export interface AuthResponse {
  access_token: string;
  usuario: Usuario;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>('/auth/login', data);
  return response.data;
};