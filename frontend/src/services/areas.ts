import { api } from './api';
import type { Area } from '../types/entities';

export type AreaPayload = {
  name: string;
  description?: string | null;
  color?: string | null;
  isActive?: boolean;
};

export async function getAreas(): Promise<Area[]> {
  const { data } = await api.get<Area[]>('/api/areas');
  return data;
}

export async function createArea(payload: AreaPayload): Promise<Area> {
  const { data } = await api.post<Area>('/api/areas', payload);
  return data;
}

export async function updateArea(id: string, payload: Partial<AreaPayload>): Promise<Area> {
  const { data } = await api.put<Area>(`/api/areas/${id}`, payload);
  return data;
}

export async function deleteArea(id: string): Promise<void> {
  await api.delete(`/api/areas/${id}`);
}
