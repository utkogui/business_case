import { z } from 'zod';

export const allocationParamsSchema = z.object({
  projectId: z.string().cuid(),
  allocationId: z.string().cuid().optional(),
});

export const createAllocationSchema = z.object({
  professionalId: z.string().cuid(),
  areaId: z.string().cuid().optional(),
  plannedHours: z.number().nonnegative(),
  actualHours: z.number().nonnegative(),
  notes: z.string().optional().nullable(),
});

export const updateAllocationSchema = createAllocationSchema.partial();
