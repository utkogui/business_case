import { api } from './api';
import type { Project, ProjectComplexity, ProjectStatus } from '../types/entities';

export type ProjectPayload = {
  name: string;
  client: string;
  projectType: string;
  description?: string | null;
  plannedRevenue: number;
  actualRevenue?: number | null;
  complexity: ProjectComplexity;
  status: ProjectStatus;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  notes?: string | null;
  executiveConclusion?: string | null;
  strategicProfitability?: number | null;
  strategicOrganization?: number | null;
  strategicClient?: number | null;
  strategicFuturePotential?: number | null;
  strategicPortfolio?: number | null;
};

export async function getProjects(): Promise<Project[]> {
  const { data } = await api.get<Project[]>('/api/projects');
  return data;
}

export async function getProjectById(id: string): Promise<Project> {
  const { data } = await api.get<Project>(`/api/projects/${id}`);
  return data;
}

export async function createProject(payload: ProjectPayload): Promise<Project> {
  const { data } = await api.post<Project>('/api/projects', payload);
  return data;
}

export async function updateProject(id: string, payload: Partial<ProjectPayload>): Promise<Project> {
  const { data } = await api.put<Project>(`/api/projects/${id}`, payload);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/api/projects/${id}`);
}
