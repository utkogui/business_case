import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/app-error';
import { buildProjectBusinessCase } from './business-case';

type ProjectPayload = {
  name?: string;
  client?: string;
  projectType?: string;
  description?: string | null;
  plannedRevenue?: number;
  actualRevenue?: number | null;
  complexity?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date | null;
  actualEndDate?: Date | null;
  notes?: string | null;
  executiveConclusion?: string | null;
  strategicProfitability?: number | null;
  strategicOrganization?: number | null;
  strategicClient?: number | null;
  strategicFuturePotential?: number | null;
  strategicPortfolio?: number | null;
};

function round2(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

function validateDateRange(startDate: Date, endDate: Date, fieldPrefix: string): void {
  if (endDate < startDate) {
    throw new AppError(`${fieldPrefix}: data final deve ser maior ou igual a data inicial`, 400);
  }
}

function projectInclude() {
  return {
    allocations: {
      include: {
        area: true,
        professional: {
          include: {
            area: true,
          },
        },
      },
    },
  };
}

export async function listProjects() {
  return prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getProjectById(id: string) {
  const project = await prisma.project.findUnique({ where: { id }, include: projectInclude() });
  if (!project) throw new AppError('Projeto nao encontrado', 404);
  return project;
}

export async function createProject(payload: ProjectPayload) {
  validateDateRange(payload.plannedStartDate!, payload.plannedEndDate!, 'Prazo planejado');

  if (payload.actualStartDate && payload.actualEndDate) {
    validateDateRange(payload.actualStartDate, payload.actualEndDate, 'Prazo real');
  }

  return prisma.project.create({
    data: {
      name: payload.name!,
      client: payload.client!,
      projectType: payload.projectType!,
      description: payload.description ?? null,
      plannedRevenue: round2(payload.plannedRevenue!),
      actualRevenue: payload.actualRevenue !== undefined && payload.actualRevenue !== null ? round2(payload.actualRevenue) : null,
      complexity: payload.complexity!,
      status: payload.status!,
      plannedStartDate: payload.plannedStartDate!,
      plannedEndDate: payload.plannedEndDate!,
      actualStartDate: payload.actualStartDate ?? null,
      actualEndDate: payload.actualEndDate ?? null,
      notes: payload.notes ?? null,
      executiveConclusion: payload.executiveConclusion ?? null,
      strategicProfitability: payload.strategicProfitability ?? null,
      strategicOrganization: payload.strategicOrganization ?? null,
      strategicClient: payload.strategicClient ?? null,
      strategicFuturePotential: payload.strategicFuturePotential ?? null,
      strategicPortfolio: payload.strategicPortfolio ?? null,
    },
  });
}

export async function updateProject(id: string, payload: ProjectPayload) {
  const current = await getProjectById(id);

  const plannedStartDate = payload.plannedStartDate ?? current.plannedStartDate;
  const plannedEndDate = payload.plannedEndDate ?? current.plannedEndDate;
  validateDateRange(plannedStartDate, plannedEndDate, 'Prazo planejado');

  const actualStartDate = payload.actualStartDate ?? current.actualStartDate;
  const actualEndDate = payload.actualEndDate ?? current.actualEndDate;

  if (actualStartDate && actualEndDate) {
    validateDateRange(actualStartDate, actualEndDate, 'Prazo real');
  }

  return prisma.project.update({
    where: { id },
    data: {
      name: payload.name,
      client: payload.client,
      projectType: payload.projectType,
      description: payload.description,
      plannedRevenue: payload.plannedRevenue !== undefined ? round2(payload.plannedRevenue) : undefined,
      actualRevenue: payload.actualRevenue !== undefined ? (payload.actualRevenue === null ? null : round2(payload.actualRevenue)) : undefined,
      complexity: payload.complexity,
      status: payload.status,
      plannedStartDate: payload.plannedStartDate,
      plannedEndDate: payload.plannedEndDate,
      actualStartDate: payload.actualStartDate,
      actualEndDate: payload.actualEndDate,
      notes: payload.notes,
      executiveConclusion: payload.executiveConclusion,
      strategicProfitability: payload.strategicProfitability,
      strategicOrganization: payload.strategicOrganization,
      strategicClient: payload.strategicClient,
      strategicFuturePotential: payload.strategicFuturePotential,
      strategicPortfolio: payload.strategicPortfolio,
    },
  });
}

export async function deleteProject(id: string): Promise<void> {
  await getProjectById(id);
  await prisma.project.delete({ where: { id } });
}

export async function getProjectBusinessCase(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: projectInclude(),
  });

  if (!project) throw new AppError('Projeto nao encontrado', 404);

  return buildProjectBusinessCase(project);
}
