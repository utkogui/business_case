import { ContractType } from '@prisma/client';
import { z } from 'zod';

const contractTypeValues = [ContractType.CLT, ContractType.PJ, ContractType.PARTNER, ContractType.FREELANCER] as const;

export const professionalIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const createProfessionalSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  roleTitle: z.string().min(2),
  contractType: z.enum(contractTypeValues),
  monthlyCost: z.number().positive(),
  monthlyHours: z.number().positive(),
  overheadRate: z.number().min(0),
  areaId: z.string().cuid(),
  isActive: z.boolean().optional().default(true),
});

export const updateProfessionalSchema = createProfessionalSchema.partial();
