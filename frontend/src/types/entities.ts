export type EntityId = string;

export type Area = {
  id: EntityId;
  name: string;
  description: string | null;
  color: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContractType = 'CLT' | 'PJ' | 'PARTNER' | 'FREELANCER';

export type Professional = {
  id: EntityId;
  name: string;
  email: string | null;
  roleTitle: string;
  contractType: ContractType;
  monthlyCost: string | number;
  monthlyHours: string | number;
  overheadRate: string | number;
  hourlyCost: string | number;
  isActive: boolean;
  areaId: EntityId;
  area: Area;
  createdAt: string;
  updatedAt: string;
};

export type ProjectComplexity = 'LOW' | 'MEDIUM' | 'HIGH';
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export type Project = {
  id: EntityId;
  name: string;
  client: string;
  projectType: string;
  description: string | null;
  plannedRevenue: string | number;
  actualRevenue: string | number | null;
  complexity: ProjectComplexity;
  status: ProjectStatus;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
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

export type Allocation = {
  id: EntityId;
  projectId: EntityId;
  professionalId: EntityId;
  areaId: EntityId;
  plannedHours: string | number;
  actualHours: string | number;
  hourlyCostSnapshot: string | number;
  plannedCost: string | number;
  actualCost: string | number;
  notes: string | null;
  area: Area;
  professional: Professional;
  createdAt: string;
  updatedAt: string;
};
