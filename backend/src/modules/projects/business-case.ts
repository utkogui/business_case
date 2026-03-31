import type { Prisma } from '@prisma/client';

type ProjectWithAllocations = Prisma.ProjectGetPayload<{
  include: {
    allocations: {
      include: {
        area: true;
        professional: {
          include: {
            area: true;
          };
        };
      };
    };
  };
}>;

type HealthStatus = 'EXCELLENT' | 'HEALTHY' | 'ATTENTION' | 'CRITICAL';
type MarginClassification = 'EXCELLENT' | 'HEALTHY' | 'ATTENTION' | 'CRITICAL' | 'LOSS';

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function daysBetween(start?: Date | null, end?: Date | null): number | null {
  if (!start || !end) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.ceil((end.getTime() - start.getTime()) / msPerDay);
  return diff >= 0 ? diff : 0;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function classifyMargin(marginPercentage: number | null): MarginClassification {
  if (marginPercentage === null) return 'CRITICAL';
  if (marginPercentage < 0) return 'LOSS';
  if (marginPercentage < 15) return 'CRITICAL';
  if (marginPercentage < 25) return 'ATTENTION';
  if (marginPercentage <= 35) return 'HEALTHY';
  return 'EXCELLENT';
}

function calculateHealthStatus(params: {
  marginPercentage: number | null;
  scheduleDeviation: number | null;
  hoursDeviation: number | null;
  strategicScore: number | null;
}): { score: number; status: HealthStatus } {
  const marginScoreMap: Record<MarginClassification, number> = {
    EXCELLENT: 95,
    HEALTHY: 78,
    ATTENTION: 58,
    CRITICAL: 35,
    LOSS: 10,
  };

  const marginClassification = classifyMargin(params.marginPercentage);
  const marginScore = marginScoreMap[marginClassification];

  const scheduleDeviation = params.scheduleDeviation ?? 100;
  const scheduleScore =
    scheduleDeviation <= 0 ? 100 : scheduleDeviation <= 10 ? 80 : scheduleDeviation <= 20 ? 60 : scheduleDeviation <= 35 ? 40 : 20;

  const hoursDeviation = params.hoursDeviation ?? 100;
  const hoursScore = hoursDeviation <= 0 ? 100 : hoursDeviation <= 10 ? 80 : hoursDeviation <= 20 ? 60 : hoursDeviation <= 35 ? 40 : 20;

  const strategicScore = params.strategicScore ?? 1;
  const strategicNormalized = strategicScore * 20;

  const score = round2((marginScore + scheduleScore + hoursScore + strategicNormalized) / 4);

  if (score >= 85) return { score, status: 'EXCELLENT' };
  if (score >= 70) return { score, status: 'HEALTHY' };
  if (score >= 50) return { score, status: 'ATTENTION' };
  return { score, status: 'CRITICAL' };
}

export function buildProjectBusinessCase(project: ProjectWithAllocations) {
  const revenue = toNumber(project.actualRevenue) > 0 ? toNumber(project.actualRevenue) : toNumber(project.plannedRevenue);

  const totalPlannedCost = round2(project.allocations.reduce((acc, allocation) => acc + toNumber(allocation.plannedCost), 0));
  const totalRealCost = round2(project.allocations.reduce((acc, allocation) => acc + toNumber(allocation.actualCost), 0));
  const totalPlannedHours = round2(project.allocations.reduce((acc, allocation) => acc + toNumber(allocation.plannedHours), 0));
  const totalRealHours = round2(project.allocations.reduce((acc, allocation) => acc + toNumber(allocation.actualHours), 0));

  const margin = round2(revenue - totalRealCost);
  const marginPercentage = revenue > 0 ? round2((margin / revenue) * 100) : null;
  const marginClassification = classifyMargin(marginPercentage);

  const plannedDays = daysBetween(project.plannedStartDate, project.plannedEndDate);
  const realDays = daysBetween(project.actualStartDate, project.actualEndDate);

  const scheduleDeviation =
    plannedDays && plannedDays > 0 && realDays !== null ? round2(((realDays - plannedDays) / plannedDays) * 100) : null;

  const hoursDeviation = totalPlannedHours > 0 ? round2(((totalRealHours - totalPlannedHours) / totalPlannedHours) * 100) : null;

  const cpi = totalRealCost > 0 ? round2(revenue / totalRealCost) : null;
  const spi = plannedDays && plannedDays > 0 && realDays && realDays > 0 ? round2(plannedDays / realDays) : null;

  const strategicValues = [
    project.strategicProfitability,
    project.strategicOrganization,
    project.strategicClient,
    project.strategicFuturePotential,
    project.strategicPortfolio,
  ].filter((value): value is number => typeof value === 'number');

  const strategicScore = average(strategicValues);
  const strategicScoreRounded = strategicScore !== null ? round2(strategicScore) : null;

  const health = calculateHealthStatus({
    marginPercentage,
    scheduleDeviation,
    hoursDeviation,
    strategicScore: strategicScoreRounded,
  });

  const areaCostMap = new Map<string, { areaId: string; areaName: string; actualCost: number; plannedCost: number }>();
  const professionalCostMap = new Map<
    string,
    {
      professionalId: string;
      professionalName: string;
      areaId: string;
      areaName: string;
      plannedHours: number;
      actualHours: number;
      hourlyCostSnapshot: number;
      plannedCost: number;
      actualCost: number;
      evaluationSum: number;
      evaluationCount: number;
      averageEvaluation: number | null;
    }
  >();

  for (const allocation of project.allocations) {
    const actualCost = toNumber(allocation.actualCost);
    const plannedCost = toNumber(allocation.plannedCost);

    const areaBucket = areaCostMap.get(allocation.areaId) ?? {
      areaId: allocation.areaId,
      areaName: allocation.area.name,
      actualCost: 0,
      plannedCost: 0,
    };
    areaBucket.actualCost += actualCost;
    areaBucket.plannedCost += plannedCost;
    areaCostMap.set(allocation.areaId, areaBucket);

    const professionalBucket = professionalCostMap.get(allocation.professionalId) ?? {
      professionalId: allocation.professionalId,
      professionalName: allocation.professional.name,
      areaId: allocation.areaId,
      areaName: allocation.area.name,
      plannedHours: 0,
      actualHours: 0,
      hourlyCostSnapshot: toNumber(allocation.hourlyCostSnapshot),
      plannedCost: 0,
      actualCost: 0,
      evaluationSum: 0,
      evaluationCount: 0,
      averageEvaluation: null,
    };
    professionalBucket.plannedHours += toNumber(allocation.plannedHours);
    professionalBucket.actualHours += toNumber(allocation.actualHours);
    professionalBucket.plannedCost += plannedCost;
    professionalBucket.actualCost += actualCost;
    if (allocation.professionalEvaluation !== null) {
      professionalBucket.evaluationSum += allocation.professionalEvaluation;
      professionalBucket.evaluationCount += 1;
      professionalBucket.averageEvaluation = professionalBucket.evaluationSum / professionalBucket.evaluationCount;
    }
    professionalCostMap.set(allocation.professionalId, professionalBucket);
  }

  const costsByArea = Array.from(areaCostMap.values())
    .map((item) => ({
      ...item,
      actualCost: round2(item.actualCost),
      plannedCost: round2(item.plannedCost),
    }))
    .sort((a, b) => b.actualCost - a.actualCost);

  const costsByProfessional = Array.from(professionalCostMap.values())
    .map((item) => ({
      ...item,
      plannedHours: round2(item.plannedHours),
      actualHours: round2(item.actualHours),
      plannedCost: round2(item.plannedCost),
      actualCost: round2(item.actualCost),
      hourlyCostSnapshot: round2(item.hourlyCostSnapshot),
      averageEvaluation: item.averageEvaluation === null ? null : round2(item.averageEvaluation),
    }))
    .sort((a, b) => b.actualCost - a.actualCost);

  return {
    project: {
      id: project.id,
      name: project.name,
      client: project.client,
      projectType: project.projectType,
      description: project.description,
      complexity: project.complexity,
      status: project.status,
      plannedStartDate: project.plannedStartDate,
      plannedEndDate: project.plannedEndDate,
      actualStartDate: project.actualStartDate,
      actualEndDate: project.actualEndDate,
      plannedRevenue: toNumber(project.plannedRevenue),
      actualRevenue: project.actualRevenue ? toNumber(project.actualRevenue) : null,
      notes: project.notes,
      executiveConclusion: project.executiveConclusion,
      strategicProfitability: project.strategicProfitability,
      strategicOrganization: project.strategicOrganization,
      strategicClient: project.strategicClient,
      strategicFuturePotential: project.strategicFuturePotential,
      strategicPortfolio: project.strategicPortfolio,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    kpis: {
      revenue: round2(revenue),
      totalPlannedCost,
      totalRealCost,
      margin,
      marginPercentage,
      marginClassification,
      plannedDays,
      realDays,
      scheduleDeviation,
      totalPlannedHours,
      totalRealHours,
      hoursDeviation,
      cpi,
      spi,
      reworkRate: null as number | null,
    },
    strategic: {
      profitability: project.strategicProfitability,
      organization: project.strategicOrganization,
      client: project.strategicClient,
      futurePotential: project.strategicFuturePotential,
      portfolio: project.strategicPortfolio,
      score: strategicScoreRounded,
    },
    health: {
      score: health.score,
      status: health.status,
    },
    costsByArea,
    costsByProfessional,
  };
}
