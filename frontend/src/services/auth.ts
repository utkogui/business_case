import { api } from './api';
import type { LoginPayload, LoginResponse, MeResponse } from '../types/auth';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', payload);
  return data;
}

export async function me(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/api/auth/me');
  return data;
}
