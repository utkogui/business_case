export type HealthStatus = 'EXCELLENT' | 'HEALTHY' | 'ATTENTION' | 'CRITICAL';

export type DashboardOverviewProject = {
  id: string;
  name: string;
  client: string;
  projectType: string;
  status: string;
  revenue: number;
  totalCost: number;
  margin: number;
  marginPercentage: number | null;
  healthStatus: HealthStatus;
  healthStatusLabel: string;
  healthScore: number;
  strategicScore: number | null;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
};

export type DashboardOverviewResponse = {
  kpis: {
    totalProjects: number;
    totalRevenue: number;
    totalCost: number;
    averageMarginPercentage: number;
    criticalProjects: number;
    healthyProjects: number;
  };
  projects: DashboardOverviewProject[];
};

export type ProjectBusinessCaseResponse = {
  project: {
    id: string;
    name: string;
    client: string;
    projectType: string;
    description: string | null;
    complexity: string;
    status: string;
    plannedStartDate: string;
    plannedEndDate: string;
    actualStartDate: string | null;
    actualEndDate: string | null;
    plannedRevenue: number;
    actualRevenue: number | null;
    notes: string | null;
    executiveConclusion: string | null;
    strategicProfitability: number | null;
    strategicOrganization: number | null;
    strategicClient: number | null;
    strategicFuturePotential: number | null;
    strategicPortfolio: number | null;
    createdAt: string;
    updatedAt: string;
  };
  kpis: {
    revenue: number;
    totalPlannedCost: number;
    totalRealCost: number;
    margin: number;
    marginPercentage: number | null;
    marginClassification: string;
    plannedDays: number | null;
    realDays: number | null;
    scheduleDeviation: number | null;
    totalPlannedHours: number;
    totalRealHours: number;
    hoursDeviation: number | null;
    cpi: number | null;
    spi: number | null;
    reworkRate: number | null;
  };
  strategic: {
    profitability: number | null;
    organization: number | null;
    client: number | null;
    futurePotential: number | null;
    portfolio: number | null;
    score: number | null;
  };
  health: {
    score: number;
    status: HealthStatus;
  };
  costsByArea: Array<{
    areaId: string;
    areaName: string;
    actualCost: number;
    plannedCost: number;
  }>;
  costsByProfessional: Array<{
    professionalId: string;
    professionalName: string;
    areaId: string;
    areaName: string;
    plannedHours: number;
    actualHours: number;
    hourlyCostSnapshot: number;
    plannedCost: number;
    actualCost: number;
  }>;
};
