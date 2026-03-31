import { api } from './api';
import type { Allocation } from '../types/entities';

export type AllocationPayload = {
  professionalId: string;
  areaId?: string;
  plannedHours: number;
  actualHours: number;
  professionalEvaluation?: number | null;
  notes?: string | null;
};

export async function getAllocations(projectId: string): Promise<Allocation[]> {
  const { data } = await api.get<Allocation[]>(`/api/projects/${projectId}/allocations`);
  return data;
}

export async function createAllocation(projectId: string, payload: AllocationPayload): Promise<Allocation> {
  const { data } = await api.post<Allocation>(`/api/projects/${projectId}/allocations`, payload);
  return data;
}

export async function updateAllocation(projectId: string, allocationId: string, payload: Partial<AllocationPayload>): Promise<Allocation> {
  const { data } = await api.put<Allocation>(`/api/projects/${projectId}/allocations/${allocationId}`, payload);
  return data;
}

export async function deleteAllocation(projectId: string, allocationId: string): Promise<void> {
  await api.delete(`/api/projects/${projectId}/allocations/${allocationId}`);
}
