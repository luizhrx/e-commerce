import api from './api';
import { type UsuarioLogado } from '../context/AuthContext';

export interface AuthResponse {
  token: string;
  usuario: UsuarioLogado;
}

export const authService = {
  async login(dados: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', dados);
    return response.data;
  },

  async registro(dados: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/registro', dados);
    return response.data;
  },

 
  async me(): Promise<UsuarioLogado> {
    const response = await api.get<UsuarioLogado>('/auth/me');
    return response.data;
  }
};