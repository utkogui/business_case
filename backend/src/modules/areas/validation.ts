import { z } from 'zod';

export const areaIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const createAreaSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateAreaSchema = createAreaSchema.partial();
