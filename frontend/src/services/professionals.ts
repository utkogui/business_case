import { api } from './api';
import type { ContractType, Professional } from '../types/entities';

export type ProfessionalPayload = {
  name: string;
  email?: string | null;
  roleTitle: string;
  contractType: ContractType;
  monthlyCost: number;
  monthlyHours: number;
  overheadRate: number;
  areaId: string;
  isActive?: boolean;
};

export async function getProfessionals(): Promise<Professional[]> {
  const { data } = await api.get<Professional[]>('/api/professionals');
  return data;
}

export async function createProfessional(payload: ProfessionalPayload): Promise<Professional> {
  const { data } = await api.post<Professional>('/api/professionals', payload);
  return data;
}

export async function updateProfessional(id: string, payload: Partial<ProfessionalPayload>): Promise<Professional> {
  const { data } = await api.put<Professional>(`/api/professionals/${id}`, payload);
  return data;
}

export async function deleteProfessional(id: string): Promise<void> {
  await api.delete(`/api/professionals/${id}`);
}
