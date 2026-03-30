import { prisma } from '../../config/prisma';
import { buildProjectBusinessCase } from '../projects/business-case';

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function mapHealthStatus(status: 'EXCELLENT' | 'HEALTHY' | 'ATTENTION' | 'CRITICAL'): string {
  if (status === 'EXCELLENT') return 'Excelente';
  if (status === 'HEALTHY') return 'Saudavel';
  if (status === 'ATTENTION') return 'Atencao';
  return 'Critico';
}

export async function getOverview() {
  const projects = await prisma.project.findMany({
    include: {
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
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const summaries = projects.map((project) => {
    const businessCase = buildProjectBusinessCase(project);

    return {
      id: businessCase.project.id,
      name: businessCase.project.name,
      client: businessCase.project.client,
      projectType: businessCase.project.projectType,
      status: businessCase.project.status,
      revenue: businessCase.kpis.revenue,
      totalCost: businessCase.kpis.totalRealCost,
      margin: businessCase.kpis.margin,
      marginPercentage: businessCase.kpis.marginPercentage,
      healthStatus: businessCase.health.status,
      healthScore: businessCase.health.score,
      strategicScore: businessCase.strategic.score,
      plannedStartDate: businessCase.project.plannedStartDate,
      plannedEndDate: businessCase.project.plannedEndDate,
      actualStartDate: businessCase.project.actualStartDate,
      actualEndDate: businessCase.project.actualEndDate,
    };
  });

  const totalProjects = summaries.length;
  const totalRevenue = round2(summaries.reduce((acc, item) => acc + item.revenue, 0));
  const totalCost = round2(summaries.reduce((acc, item) => acc + item.totalCost, 0));
  const projectsWithMargin = summaries.filter((item) => item.marginPercentage !== null);
  const averageMarginPercentage = projectsWithMargin.length
    ? round2(projectsWithMargin.reduce((acc, item) => acc + (item.marginPercentage ?? 0), 0) / projectsWithMargin.length)
    : 0;

  const criticalProjects = summaries.filter((item) => item.healthStatus === 'CRITICAL').length;
  const healthyProjects = summaries.filter((item) => item.healthStatus === 'HEALTHY' || item.healthStatus === 'EXCELLENT').length;

  return {
    kpis: {
      totalProjects,
      totalRevenue,
      totalCost,
      averageMarginPercentage,
      criticalProjects,
      healthyProjects,
    },
    projects: summaries.map((item) => ({
      ...item,
      healthStatusLabel: mapHealthStatus(item.healthStatus),
    })),
  };
}
