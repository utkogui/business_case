import { ContractType, Prisma, PrismaClient, ProjectComplexity, ProjectStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function round2(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

function calculateHourlyCost(monthlyCost: number, monthlyHours: number, overheadRate: number): Prisma.Decimal {
  if (monthlyHours <= 0) {
    throw new Error('monthlyHours deve ser maior que zero para calcular custo hora.');
  }

  return round2(monthlyCost / monthlyHours + overheadRate);
}

async function seedAdminUser(): Promise<void> {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@businesscase.com' },
    update: {
      name: 'Administrador',
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      name: 'Administrador',
      email: 'admin@businesscase.com',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
}

async function seedAreas() {
  const areas = [
    { name: 'Comercial', description: 'Atuacao comercial e negociacao', color: '#2f54eb' },
    { name: 'Financeiro', description: 'Controles financeiros e faturamento', color: '#13c2c2' },
    { name: 'Juridico', description: 'Contratos, riscos e compliance', color: '#722ed1' },
    { name: 'Estrategia', description: 'Direcionamento estrategico e plano de negocio', color: '#faad14' },
    { name: 'Service Design', description: 'Mapeamento de jornada e servicos', color: '#eb2f96' },
    { name: 'Design', description: 'UX/UI e design de experiencia', color: '#fa8c16' },
    { name: 'Desenvolvimento', description: 'Implementacao tecnica e qualidade', color: '#52c41a' },
    { name: 'Gestao', description: 'Coordenacao, ritos e planejamento', color: '#1890ff' },
    { name: 'Produto', description: 'Estrategia e governanca de produto', color: '#7cb305' },
    { name: 'Pos-venda', description: 'Relacionamento e expansao no cliente', color: '#f5222d' },
  ];

  const result: Record<string, { id: string; name: string }> = {};

  for (const area of areas) {
    const created = await prisma.area.upsert({
      where: { name: area.name },
      update: {
        description: area.description,
        color: area.color,
        isActive: true,
      },
      create: {
        name: area.name,
        description: area.description,
        color: area.color,
        isActive: true,
      },
      select: { id: true, name: true },
    });

    result[created.name] = created;
  }

  return result;
}

async function seedProfessionals(areaMap: Record<string, { id: string; name: string }>) {
  const professionals = [
    {
      name: 'Fernanda Souza',
      email: 'fernanda.souza@businesscase.com',
      roleTitle: 'Executiva Comercial',
      contractType: ContractType.CLT,
      monthlyCost: 22000,
      monthlyHours: 160,
      overheadRate: 18,
      areaName: 'Comercial',
    },
    {
      name: 'Carlos Mendes',
      email: 'carlos.mendes@businesscase.com',
      roleTitle: 'Controller Financeiro',
      contractType: ContractType.CLT,
      monthlyCost: 18000,
      monthlyHours: 160,
      overheadRate: 16,
      areaName: 'Financeiro',
    },
    {
      name: 'Juliana Lima',
      email: 'juliana.lima@businesscase.com',
      roleTitle: 'Advogada Corporativa',
      contractType: ContractType.PJ,
      monthlyCost: 20000,
      monthlyHours: 140,
      overheadRate: 14,
      areaName: 'Juridico',
    },
    {
      name: 'Rafael Barros',
      email: 'rafael.barros@businesscase.com',
      roleTitle: 'Head de Estrategia',
      contractType: ContractType.PARTNER,
      monthlyCost: 28000,
      monthlyHours: 120,
      overheadRate: 22,
      areaName: 'Estrategia',
    },
    {
      name: 'Aline Rocha',
      email: 'aline.rocha@businesscase.com',
      roleTitle: 'Service Designer Senior',
      contractType: ContractType.CLT,
      monthlyCost: 17000,
      monthlyHours: 160,
      overheadRate: 12,
      areaName: 'Service Design',
    },
    {
      name: 'Bruno Vieira',
      email: 'bruno.vieira@businesscase.com',
      roleTitle: 'Product Designer Senior',
      contractType: ContractType.CLT,
      monthlyCost: 16000,
      monthlyHours: 160,
      overheadRate: 10,
      areaName: 'Design',
    },
    {
      name: 'Patricia Nunes',
      email: 'patricia.nunes@businesscase.com',
      roleTitle: 'Engenheira de Software',
      contractType: ContractType.CLT,
      monthlyCost: 20000,
      monthlyHours: 168,
      overheadRate: 12,
      areaName: 'Desenvolvimento',
    },
    {
      name: 'Marcos Teixeira',
      email: 'marcos.teixeira@businesscase.com',
      roleTitle: 'Gerente de Projetos',
      contractType: ContractType.CLT,
      monthlyCost: 19000,
      monthlyHours: 160,
      overheadRate: 14,
      areaName: 'Gestao',
    },
    {
      name: 'Laura Matos',
      email: 'laura.matos@businesscase.com',
      roleTitle: 'Product Manager',
      contractType: ContractType.PJ,
      monthlyCost: 21000,
      monthlyHours: 160,
      overheadRate: 15,
      areaName: 'Produto',
    },
    {
      name: 'Renato Alves',
      email: 'renato.alves@businesscase.com',
      roleTitle: 'Consultor Pos-venda',
      contractType: ContractType.FREELANCER,
      monthlyCost: 12000,
      monthlyHours: 120,
      overheadRate: 8,
      areaName: 'Pos-venda',
    },
  ];

  const result: Record<string, { id: string; name: string; areaId: string; hourlyCost: Prisma.Decimal }> = {};

  for (const professional of professionals) {
    const area = areaMap[professional.areaName];
    const hourlyCost = calculateHourlyCost(professional.monthlyCost, professional.monthlyHours, professional.overheadRate);

    const created = await prisma.professional.upsert({
      where: { email: professional.email },
      update: {
        name: professional.name,
        roleTitle: professional.roleTitle,
        contractType: professional.contractType,
        monthlyCost: round2(professional.monthlyCost),
        monthlyHours: round2(professional.monthlyHours),
        overheadRate: round2(professional.overheadRate),
        hourlyCost,
        areaId: area.id,
        isActive: true,
      },
      create: {
        name: professional.name,
        email: professional.email,
        roleTitle: professional.roleTitle,
        contractType: professional.contractType,
        monthlyCost: round2(professional.monthlyCost),
        monthlyHours: round2(professional.monthlyHours),
        overheadRate: round2(professional.overheadRate),
        hourlyCost,
        areaId: area.id,
        isActive: true,
      },
      select: { id: true, name: true, areaId: true, hourlyCost: true },
    });

    result[created.name] = created;
  }

  return result;
}

async function seedProjects() {
  await prisma.projectAllocation.deleteMany();
  await prisma.project.deleteMany();

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Portal Omnichannel de Atendimento',
        client: 'Grupo Orion',
        projectType: 'Transformacao Digital',
        description: 'Implementacao de portal com CRM, automacoes e governanca de atendimento.',
        plannedRevenue: round2(420000),
        actualRevenue: round2(465000),
        complexity: ProjectComplexity.HIGH,
        status: ProjectStatus.COMPLETED,
        plannedStartDate: new Date('2025-01-06'),
        plannedEndDate: new Date('2025-04-30'),
        actualStartDate: new Date('2025-01-13'),
        actualEndDate: new Date('2025-05-20'),
        notes: 'Projeto com escopo expandido em 2 sprints por demanda do cliente.',
        strategicProfitability: 4,
        strategicOrganization: 3,
        strategicClient: 5,
        strategicFuturePotential: 5,
        strategicPortfolio: 4,
        executiveConclusion:
          'Apesar do atraso, o projeto consolidou parceria estrategica e abriu novas frentes de receita recorrente no cliente.',
      },
    }),
    prisma.project.create({
      data: {
        name: 'Plataforma de Analytics Comercial',
        client: 'Varejo Sul',
        projectType: 'Data & BI',
        description: 'Plataforma para consolidacao de dados comerciais e indicadores em tempo real.',
        plannedRevenue: round2(280000),
        actualRevenue: round2(272000),
        complexity: ProjectComplexity.MEDIUM,
        status: ProjectStatus.COMPLETED,
        plannedStartDate: new Date('2025-03-03'),
        plannedEndDate: new Date('2025-06-10'),
        actualStartDate: new Date('2025-03-03'),
        actualEndDate: new Date('2025-06-04'),
        notes: 'Boa disciplina de escopo e participacao ativa do cliente nas validacoes.',
        strategicProfitability: 5,
        strategicOrganization: 4,
        strategicClient: 4,
        strategicFuturePotential: 3,
        strategicPortfolio: 4,
        executiveConclusion:
          'Projeto com alta eficiencia operacional e boa margem, recomendado como referencia para novos contratos de BI.',
      },
    }),
    prisma.project.create({
      data: {
        name: 'Redesenho de Jornada B2B',
        client: 'NovaLog',
        projectType: 'Consultoria de Produto',
        description: 'Diagnostico de jornada e plano de evolucao de produto para operacao B2B.',
        plannedRevenue: round2(190000),
        actualRevenue: null,
        complexity: ProjectComplexity.MEDIUM,
        status: ProjectStatus.IN_PROGRESS,
        plannedStartDate: new Date('2025-07-07'),
        plannedEndDate: new Date('2025-09-30'),
        actualStartDate: new Date('2025-07-10'),
        actualEndDate: null,
        notes: 'Projeto em andamento com alto envolvimento de estrategia e produto.',
        strategicProfitability: 3,
        strategicOrganization: 3,
        strategicClient: 5,
        strategicFuturePotential: 5,
        strategicPortfolio: 5,
        executiveConclusion: 'Potencial estrategico elevado, com retorno financeiro ainda em consolidacao.',
      },
    }),
  ]);

  return projects;
}

type AllocationInput = {
  professionalName: string;
  plannedHours: number;
  actualHours: number;
  notes: string;
};

async function seedAllocations(
  projects: Awaited<ReturnType<typeof seedProjects>>,
  professionals: Record<string, { id: string; name: string; areaId: string; hourlyCost: Prisma.Decimal }>,
): Promise<void> {
  const matrix: Record<string, AllocationInput[]> = {
    'Portal Omnichannel de Atendimento': [
      { professionalName: 'Fernanda Souza', plannedHours: 32, actualHours: 40, notes: 'Negociacao e alinhamentos executivos' },
      { professionalName: 'Juliana Lima', plannedHours: 20, actualHours: 28, notes: 'Revisao contratual e aditivos de escopo' },
      { professionalName: 'Rafael Barros', plannedHours: 30, actualHours: 36, notes: 'Direcionamento estrategico' },
      { professionalName: 'Aline Rocha', plannedHours: 80, actualHours: 88, notes: 'Blueprint de servico e jornada' },
      { professionalName: 'Bruno Vieira', plannedHours: 96, actualHours: 104, notes: 'UX e UI do portal' },
      { professionalName: 'Patricia Nunes', plannedHours: 380, actualHours: 432, notes: 'Implementacao full stack' },
      { professionalName: 'Marcos Teixeira', plannedHours: 120, actualHours: 138, notes: 'Gestao de cronograma e riscos' },
      { professionalName: 'Laura Matos', plannedHours: 56, actualHours: 64, notes: 'Priorizacao de backlog e discovery' },
      { professionalName: 'Renato Alves', plannedHours: 26, actualHours: 35, notes: 'Handover e onboarding do cliente' },
      { professionalName: 'Carlos Mendes', plannedHours: 18, actualHours: 22, notes: 'Governanca financeira e medicao' },
    ],
    'Plataforma de Analytics Comercial': [
      { professionalName: 'Fernanda Souza', plannedHours: 20, actualHours: 18, notes: 'Apoio comercial e expansao de escopo' },
      { professionalName: 'Rafael Barros', plannedHours: 24, actualHours: 22, notes: 'Estrutura de metas de negocio' },
      { professionalName: 'Bruno Vieira', plannedHours: 62, actualHours: 58, notes: 'Design de visualizacoes e experiencia' },
      { professionalName: 'Patricia Nunes', plannedHours: 280, actualHours: 260, notes: 'Pipelines, API e front-end analytics' },
      { professionalName: 'Marcos Teixeira', plannedHours: 70, actualHours: 68, notes: 'Gestao operacional do projeto' },
      { professionalName: 'Laura Matos', plannedHours: 42, actualHours: 40, notes: 'Definicao de produto e roadmap' },
      { professionalName: 'Carlos Mendes', plannedHours: 12, actualHours: 10, notes: 'Acompanhamento de rentabilidade' },
    ],
    'Redesenho de Jornada B2B': [
      { professionalName: 'Rafael Barros', plannedHours: 40, actualHours: 44, notes: 'Diagnostico estrategico de cadeia de valor' },
      { professionalName: 'Aline Rocha', plannedHours: 90, actualHours: 98, notes: 'Jornada atual e proposta de servicos' },
      { professionalName: 'Laura Matos', plannedHours: 72, actualHours: 80, notes: 'Modelo operacional de produto' },
      { professionalName: 'Marcos Teixeira', plannedHours: 50, actualHours: 54, notes: 'Ritmo de execucao e governanca' },
      { professionalName: 'Renato Alves', plannedHours: 18, actualHours: 20, notes: 'Visao de sustentacao e pos-implantacao' },
      { professionalName: 'Juliana Lima', plannedHours: 10, actualHours: 10, notes: 'Analise de clausulas e responsabilidades' },
    ],
  };

  for (const project of projects) {
    const allocations = matrix[project.name] ?? [];

    for (const allocation of allocations) {
      const professional = professionals[allocation.professionalName];
      const hourlyCostSnapshot = professional.hourlyCost;
      const plannedCost = round2(allocation.plannedHours * Number(hourlyCostSnapshot));
      const actualCost = round2(allocation.actualHours * Number(hourlyCostSnapshot));

      await prisma.projectAllocation.create({
        data: {
          projectId: project.id,
          professionalId: professional.id,
          areaId: professional.areaId,
          plannedHours: round2(allocation.plannedHours),
          actualHours: round2(allocation.actualHours),
          hourlyCostSnapshot,
          plannedCost,
          actualCost,
          notes: allocation.notes,
        },
      });
    }
  }
}

async function main(): Promise<void> {
  await seedAdminUser();
  const areaMap = await seedAreas();
  const professionals = await seedProfessionals(areaMap);
  const projects = await seedProjects();
  await seedAllocations(projects, professionals);

  console.log('Seed concluido com sucesso: usuario, areas, profissionais, projetos e alocacoes.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
