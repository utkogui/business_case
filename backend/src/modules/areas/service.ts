import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/app-error';

type AreaPayload = {
  name?: string;
  description?: string | null;
  color?: string | null;
  isActive?: boolean;
};

export async function listAreas() {
  return prisma.area.findMany({ orderBy: { name: 'asc' } });
}

export async function getAreaById(id: string) {
  const area = await prisma.area.findUnique({ where: { id } });
  if (!area) throw new AppError('Area nao encontrada', 404);
  return area;
}

export async function createArea(payload: AreaPayload) {
  try {
    return await prisma.area.create({
      data: {
        name: payload.name!,
        description: payload.description ?? null,
        color: payload.color ?? null,
        isActive: payload.isActive ?? true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('Ja existe uma area com este nome', 409);
    }
    throw error;
  }
}

export async function updateArea(id: string, payload: AreaPayload) {
  await getAreaById(id);

  try {
    return await prisma.area.update({
      where: { id },
      data: {
        name: payload.name,
        description: payload.description,
        color: payload.color,
        isActive: payload.isActive,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('Ja existe uma area com este nome', 409);
    }
    throw error;
  }
}

export async function deleteArea(id: string): Promise<void> {
  await getAreaById(id);

  try {
    await prisma.area.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new AppError('Nao e possivel remover area com dependencias', 409);
    }
    throw error;
  }
}
