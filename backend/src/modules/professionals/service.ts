import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/app-error';

type ProfessionalPayload = {
  name?: string;
  email?: string | null;
  roleTitle?: string;
  contractType?: 'CLT' | 'PJ' | 'PARTNER' | 'FREELANCER';
  monthlyCost?: number;
  monthlyHours?: number;
  overheadRate?: number;
  areaId?: string;
  isActive?: boolean;
};

function round2(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

function calculateHourlyCost(monthlyCost: number, monthlyHours: number, overheadRate: number): Prisma.Decimal {
  if (monthlyHours <= 0) {
    throw new AppError('Carga horaria mensal deve ser maior que zero', 400);
  }

  return round2(monthlyCost / monthlyHours + overheadRate);
}

async function ensureAreaExists(areaId: string): Promise<void> {
  const area = await prisma.area.findUnique({ where: { id: areaId }, select: { id: true } });
  if (!area) throw new AppError('Area nao encontrada', 404);
}

export async function listProfessionals() {
  return prisma.professional.findMany({ include: { area: true }, orderBy: { name: 'asc' } });
}

export async function getProfessionalById(id: string) {
  const professional = await prisma.professional.findUnique({ where: { id }, include: { area: true } });
  if (!professional) throw new AppError('Profissional nao encontrado', 404);
  return professional;
}

export async function createProfessional(payload: ProfessionalPayload) {
  await ensureAreaExists(payload.areaId!);

  const hourlyCost = calculateHourlyCost(payload.monthlyCost!, payload.monthlyHours!, payload.overheadRate!);

  try {
    return await prisma.professional.create({
      data: {
        name: payload.name!,
        email: payload.email ?? null,
        roleTitle: payload.roleTitle!,
        contractType: payload.contractType!,
        monthlyCost: round2(payload.monthlyCost!),
        monthlyHours: round2(payload.monthlyHours!),
        overheadRate: round2(payload.overheadRate!),
        hourlyCost,
        areaId: payload.areaId!,
        isActive: payload.isActive ?? true,
      },
      include: { area: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('Ja existe um profissional com este email', 409);
    }
    throw error;
  }
}

export async function updateProfessional(id: string, payload: ProfessionalPayload) {
  const current = await getProfessionalById(id);

  if (payload.areaId) {
    await ensureAreaExists(payload.areaId);
  }

  const monthlyCost = payload.monthlyCost ?? Number(current.monthlyCost);
  const monthlyHours = payload.monthlyHours ?? Number(current.monthlyHours);
  const overheadRate = payload.overheadRate ?? Number(current.overheadRate);
  const hourlyCost = calculateHourlyCost(monthlyCost, monthlyHours, overheadRate);

  try {
    return await prisma.professional.update({
      where: { id },
      data: {
        name: payload.name,
        email: payload.email,
        roleTitle: payload.roleTitle,
        contractType: payload.contractType,
        monthlyCost: payload.monthlyCost !== undefined ? round2(payload.monthlyCost) : undefined,
        monthlyHours: payload.monthlyHours !== undefined ? round2(payload.monthlyHours) : undefined,
        overheadRate: payload.overheadRate !== undefined ? round2(payload.overheadRate) : undefined,
        hourlyCost,
        areaId: payload.areaId,
        isActive: payload.isActive,
      },
      include: { area: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('Ja existe um profissional com este email', 409);
    }
    throw error;
  }
}

export async function deleteProfessional(id: string): Promise<void> {
  await getProfessionalById(id);

  try {
    await prisma.professional.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new AppError('Nao e possivel remover profissional com alocacoes', 409);
    }
    throw error;
  }
}
