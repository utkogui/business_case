import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Col, DatePicker, Descriptions, Input, Row, Select, Space, Table, Tooltip, Typography } from 'antd';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { getDashboardOverview } from '../../services/dashboard';
import { formatDate } from '../../utils/formatters';
import { getApiErrorMessage } from '../../utils/http';
import type { DashboardOverviewProject } from '../../types/dashboard';
import { HealthBadge } from '../../components/common/HealthBadge';
import { KPICard } from '../../components/common/KPICard';
import { CurrencyText } from '../../components/common/CurrencyText';
import { PercentageText } from '../../components/common/PercentageText';
import { SectionCard } from '../../components/common/SectionCard';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/PageLoader';
import { StatusBadge } from '../../components/common/StatusBadge';

type DateRangeValue = [Dayjs | null, Dayjs | null] | null;

export function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [clientFilter, setClientFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [periodFilter, setPeriodFilter] = useState<DateRangeValue>(null);

  const overviewQuery = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: getDashboardOverview,
  });

  const allProjects = useMemo(() => overviewQuery.data?.projects ?? [], [overviewQuery.data?.projects]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const [start, end] = periodFilter ?? [null, null];

    return allProjects.filter((project) => {
      const matchesSearch =
        !normalizedSearch ||
        project.name.toLowerCase().includes(normalizedSearch) ||
        project.client.toLowerCase().includes(normalizedSearch);

      const matchesStatus = !statusFilter || project.status === statusFilter;
      const matchesClient = !clientFilter || project.client === clientFilter;
      const matchesType = !typeFilter || project.projectType === typeFilter;

      const referenceDate = dayjs(project.actualEndDate ?? project.plannedEndDate);
      const matchesPeriod =
        !start || !end || (referenceDate.isAfter(start.startOf('day')) && referenceDate.isBefore(end.endOf('day')));

      return matchesSearch && matchesStatus && matchesClient && matchesType && matchesPeriod;
    });
  }, [allProjects, clientFilter, periodFilter, searchTerm, statusFilter, typeFilter]);

  const summary = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalRevenue = filteredProjects.reduce((acc, item) => acc + item.revenue, 0);
    const totalCost = filteredProjects.reduce((acc, item) => acc + item.totalCost, 0);
    const margins = filteredProjects.filter((item) => item.marginPercentage !== null).map((item) => item.marginPercentage ?? 0);
    const averageMarginPercentage = margins.length ? margins.reduce((acc, value) => acc + value, 0) / margins.length : 0;
    const criticalProjects = filteredProjects.filter((item) => item.healthStatus === 'CRITICAL').length;
    const healthyProjects = filteredProjects.filter((item) => item.healthStatus === 'HEALTHY' || item.healthStatus === 'EXCELLENT').length;

    return {
      totalProjects,
      totalRevenue,
      totalCost,
      averageMarginPercentage,
      criticalProjects,
      healthyProjects,
    };
  }, [filteredProjects]);

  const clientOptions = useMemo(
    () =>
      Array.from(new Set(allProjects.map((project) => project.client))).map((value) => ({
        label: value,
        value,
      })),
    [allProjects],
  );

  const typeOptions = useMemo(
    () =>
      Array.from(new Set(allProjects.map((project) => project.projectType))).map((value) => ({
        label: value,
        value,
      })),
    [allProjects],
  );

  const columns = [
    {
      title: 'Projeto',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      ellipsis: true,
      render: (value: string) => (
        <Tooltip title={value}>
          <span>{value}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: 'client',
      key: 'client',
      width: '18%',
      ellipsis: true,
      render: (value: string) => (
        <Tooltip title={value}>
          <span>{value}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      title: 'Margem %',
      key: 'marginPercentage',
      width: '12%',
      render: (_: unknown, record: DashboardOverviewProject) => <PercentageText value={record.marginPercentage} withColor />,
    },
    {
      title: 'Saude',
      key: 'healthStatus',
      width: '10%',
      render: (_: unknown, record: DashboardOverviewProject) => <HealthBadge status={record.healthStatus} />,
    },
    {
      title: 'Acoes',
      key: 'actions',
      width: '18%',
      render: (_: unknown, record: DashboardOverviewProject) => (
        <Link to={`/projects/${record.id}`}>
          <Button type="link">Ver business case</Button>
        </Link>
      ),
    },
  ];

  if (overviewQuery.isLoading) {
    return (
      <div className="page-container">
        <Typography.Title level={3} style={{ margin: 0 }}>
          Dashboard Geral
        </Typography.Title>
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Typography.Title level={3} style={{ margin: 0 }}>
        Dashboard Geral
      </Typography.Title>

      {overviewQuery.isError ? <Alert type="error" showIcon title={getApiErrorMessage(overviewQuery.error, 'Falha ao carregar dashboard')} /> : null}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={8}>
          <KPICard title="Total de Projetos" value={summary.totalProjects} />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <KPICard title="Receita Total" value={<CurrencyText value={summary.totalRevenue} strong />} />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <KPICard title="Custo Total" value={<CurrencyText value={summary.totalCost} />} />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <KPICard title="Margem Media" value={<PercentageText value={summary.averageMarginPercentage} withColor />} />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <KPICard title="Projetos Criticos" value={summary.criticalProjects} valueStyle={{ color: '#cf1322' }} />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <KPICard title="Projetos Saudaveis" value={summary.healthyProjects} valueStyle={{ color: '#389e0d' }} />
        </Col>
      </Row>

      <SectionCard
        title="Carteira de Projetos"
        subtitle="Visao consolidada para acompanhamento executivo"
        extra={
          <Button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter(undefined);
              setClientFilter(undefined);
              setTypeFilter(undefined);
              setPeriodFilter(null);
            }}
          >
            Limpar filtros
          </Button>
        }
      >
        <Space wrap style={{ marginBottom: 12 }}>
          <Input.Search
            allowClear
            placeholder="Buscar por projeto ou cliente"
            onSearch={setSearchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={{ width: 280 }}
          />
          <Select
            allowClear
            placeholder="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            options={[
              { label: 'Planejamento', value: 'PLANNING' },
              { label: 'Em andamento', value: 'IN_PROGRESS' },
              { label: 'Concluido', value: 'COMPLETED' },
              { label: 'Arquivado', value: 'ARCHIVED' },
            ]}
          />
          <Select allowClear placeholder="Cliente" value={clientFilter} onChange={setClientFilter} style={{ width: 200 }} options={clientOptions} />
          <Select allowClear placeholder="Tipo" value={typeFilter} onChange={setTypeFilter} style={{ width: 220 }} options={typeOptions} />
          <DatePicker.RangePicker value={periodFilter} onChange={(values) => setPeriodFilter(values)} />
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredProjects}
          expandable={{
            expandedRowRender: (record: DashboardOverviewProject) => (
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
                <Descriptions.Item label="Tipo">{record.projectType}</Descriptions.Item>
                <Descriptions.Item label="Receita">
                  <CurrencyText value={record.revenue} strong />
                </Descriptions.Item>
                <Descriptions.Item label="Custo">
                  <CurrencyText value={record.totalCost} />
                </Descriptions.Item>
                <Descriptions.Item label="Margem em valor">
                  <CurrencyText value={record.margin} />
                </Descriptions.Item>
                <Descriptions.Item label="Periodo planejado">
                  <span style={{ whiteSpace: 'nowrap' }}>{`${formatDate(record.plannedStartDate)} - ${formatDate(record.plannedEndDate)}`}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Score de saude">{record.healthScore}</Descriptions.Item>
              </Descriptions>
            ),
          }}
          locale={{ emptyText: <EmptyState description="Sem projetos para os filtros selecionados" /> }}
        />
      </SectionCard>
    </div>
  );
}
