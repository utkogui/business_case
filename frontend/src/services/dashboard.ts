import { api } from './api';
import type { DashboardOverviewResponse, ProjectBusinessCaseResponse } from '../types/dashboard';

export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  const { data } = await api.get<DashboardOverviewResponse>('/api/dashboard/overview');
  return data;
}

export async function getProjectBusinessCase(projectId: string): Promise<ProjectBusinessCaseResponse> {
  const { data } = await api.get<ProjectBusinessCaseResponse>(`/api/projects/${projectId}/business-case`);
  return data;
}
