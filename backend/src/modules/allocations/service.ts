import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/app-error';

type AllocationPayload = {
  professionalId?: string;
  areaId?: string;
  plannedHours?: number;
  actualHours?: number;
  professionalEvaluation?: number | null;
  notes?: string | null;
};

function round2(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

async function ensureProjectExists(projectId: string): Promise<void> {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) throw new AppError('Projeto nao encontrado', 404);
}

async function getProfessionalSnapshot(professionalId: string) {
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: { id: true, areaId: true, hourlyCost: true, name: true },
  });

  if (!professional) throw new AppError('Profissional nao encontrado', 404);
  return professional;
}

export async function listAllocations(projectId: string) {
  await ensureProjectExists(projectId);

  return prisma.projectAllocation.findMany({
    where: { projectId },
    include: {
      area: true,
      professional: { include: { area: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createAllocation(projectId: string, payload: AllocationPayload) {
  await ensureProjectExists(projectId);

  const professional = await getProfessionalSnapshot(payload.professionalId!);
  const areaId = payload.areaId ?? professional.areaId;
  const hourlyCostSnapshot = professional.hourlyCost;
  const plannedHours = payload.plannedHours ?? 0;
  const actualHours = payload.actualHours ?? 0;

  return prisma.projectAllocation.create({
    data: {
      projectId,
      professionalId: professional.id,
      areaId,
      plannedHours: round2(plannedHours),
      actualHours: round2(actualHours),
      hourlyCostSnapshot,
      plannedCost: round2(plannedHours * Number(hourlyCostSnapshot)),
      actualCost: round2(actualHours * Number(hourlyCostSnapshot)),
      professionalEvaluation: payload.professionalEvaluation ?? null,
      notes: payload.notes ?? null,
    },
    include: {
      area: true,
      professional: { include: { area: true } },
    },
  });
}

export async function updateAllocation(projectId: string, allocationId: string, payload: AllocationPayload) {
  await ensureProjectExists(projectId);

  const current = await prisma.projectAllocation.findFirst({
    where: { id: allocationId, projectId },
    include: { professional: true },
  });

  if (!current) throw new AppError('Alocacao nao encontrada', 404);

  const professionalId = payload.professionalId ?? current.professionalId;
  const professional = await getProfessionalSnapshot(professionalId);

  const plannedHours = payload.plannedHours ?? Number(current.plannedHours);
  const actualHours = payload.actualHours ?? Number(current.actualHours);
  const hourlyCostSnapshot = professional.hourlyCost;

  return prisma.projectAllocation.update({
    where: { id: allocationId },
    data: {
      professionalId: professional.id,
      areaId: payload.areaId ?? professional.areaId,
      plannedHours: round2(plannedHours),
      actualHours: round2(actualHours),
      hourlyCostSnapshot,
      plannedCost: round2(plannedHours * Number(hourlyCostSnapshot)),
      actualCost: round2(actualHours * Number(hourlyCostSnapshot)),
      professionalEvaluation: payload.professionalEvaluation,
      notes: payload.notes,
    },
    include: {
      area: true,
      professional: { include: { area: true } },
    },
  });
}

export async function deleteAllocation(projectId: string, allocationId: string): Promise<void> {
  await ensureProjectExists(projectId);

  const current = await prisma.projectAllocation.findFirst({ where: { id: allocationId, projectId }, select: { id: true } });
  if (!current) throw new AppError('Alocacao nao encontrada', 404);

  await prisma.projectAllocation.delete({ where: { id: allocationId } });
}
