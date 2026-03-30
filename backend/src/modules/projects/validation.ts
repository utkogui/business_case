import { ProjectComplexity, ProjectStatus } from '@prisma/client';
import { z } from 'zod';

const complexityValues = [ProjectComplexity.LOW, ProjectComplexity.MEDIUM, ProjectComplexity.HIGH] as const;
const statusValues = [ProjectStatus.PLANNING, ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED, ProjectStatus.ARCHIVED] as const;

const strategicScoreField = z.number().int().min(1).max(5).optional().nullable();

export const projectIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const createProjectSchema = z.object({
  name: z.string().min(2),
  client: z.string().min(2),
  projectType: z.string().min(2),
  description: z.string().optional().nullable(),
  plannedRevenue: z.number().nonnegative(),
  actualRevenue: z.number().nonnegative().optional().nullable(),
  complexity: z.enum(complexityValues),
  status: z.enum(statusValues),
  plannedStartDate: z.coerce.date(),
  plannedEndDate: z.coerce.date(),
  actualStartDate: z.coerce.date().optional().nullable(),
  actualEndDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  executiveConclusion: z.string().optional().nullable(),
  strategicProfitability: strategicScoreField,
  strategicOrganization: strategicScoreField,
  strategicClient: strategicScoreField,
  strategicFuturePotential: strategicScoreField,
  strategicPortfolio: strategicScoreField,
});

export const updateProjectSchema = createProjectSchema.partial();
