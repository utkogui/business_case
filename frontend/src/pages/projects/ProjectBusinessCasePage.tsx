import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Row, Space, Statistic, Table, Typography } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getProjectBusinessCase } from '../../services/dashboard';
import { getApiErrorMessage } from '../../utils/http';
import { formatCurrencyBRL, formatDate, formatPercentage } from '../../utils/formatters';
import { HealthBadge } from '../../components/common/HealthBadge';
import { KPICard } from '../../components/common/KPICard';
import type { ProjectBusinessCaseResponse } from '../../types/dashboard';
import { CurrencyText } from '../../components/common/CurrencyText';
import { PercentageText } from '../../components/common/PercentageText';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/PageLoader';

function numberOrDash(value: number | null): string {
  if (value === null) return '-';
  return value.toFixed(2);
}

function percentageOrDash(value: number | null): string {
  if (value === null) return '-';
  return formatPercentage(value);
}

export function ProjectBusinessCasePage() {
  const { projectId = '' } = useParams();

  const businessCaseQuery = useQuery({
    queryKey: ['projects', projectId, 'business-case'],
    queryFn: () => getProjectBusinessCase(projectId),
    enabled: Boolean(projectId),
  });

  const data = businessCaseQuery.data;

  const deviationsAnalysis = useMemo(() => {
    if (!data) return '';

    const schedule = data.kpis.scheduleDeviation;
    const hours = data.kpis.hoursDeviation;
    const margin = data.kpis.marginPercentage;

    const insights: string[] = [];

    if (schedule !== null) {
      insights.push(schedule > 0 ? `O projeto atrasou ${formatPercentage(schedule)} em relacao ao planejamento.` : 'O prazo ficou dentro ou abaixo do planejado.');
    }

    if (hours !== null) {
      insights.push(hours > 0 ? `Houve consumo extra de horas (${formatPercentage(hours)}).` : 'Nao houve excesso de horas frente ao plano.');
    }

    if (margin !== null) {
      insights.push(`A margem final foi de ${formatPercentage(margin)} (${data.kpis.marginClassification}).`);
    }

    return insights.join(' ');
  }, [data]);

  const strategicRows = [
    { key: 'rentabilidade', label: 'Rentabilidade', value: data?.strategic.profitability ?? '-' },
    { key: 'organizacao', label: 'Organizacao', value: data?.strategic.organization ?? '-' },
    { key: 'cliente', label: 'Cliente', value: data?.strategic.client ?? '-' },
    { key: 'futuro', label: 'Potencial Futuro', value: data?.strategic.futurePotential ?? '-' },
    { key: 'portfolio', label: 'Portfolio', value: data?.strategic.portfolio ?? '-' },
  ];

  type ProfessionalCostRow = ProjectBusinessCaseResponse['costsByProfessional'][number];

  const professionalColumns = [
    { title: 'Profissional', dataIndex: 'professionalName', key: 'professionalName' },
    { title: 'Area', dataIndex: 'areaName', key: 'areaName' },
    { title: 'Horas Planejadas', dataIndex: 'plannedHours', key: 'plannedHours' },
    { title: 'Horas Reais', dataIndex: 'actualHours', key: 'actualHours' },
    {
      title: 'Custo Hora',
      key: 'hourlyCostSnapshot',
      render: (_: unknown, record: ProfessionalCostRow) => formatCurrencyBRL(record.hourlyCostSnapshot),
    },
    {
      title: 'Custo Real',
      key: 'actualCost',
      render: (_: unknown, record: ProfessionalCostRow) => formatCurrencyBRL(record.actualCost),
    },
  ];

  if (businessCaseQuery.isLoading) {
    return (
      <div className="page-container">
        <PageLoader />
      </div>
    );
  }

  if (!data && !businessCaseQuery.isError) {
    return <EmptyState description="Business case indisponivel para este projeto" />;
  }

  return (
    <div className="page-container">
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <div>
          <Link to="/projects">
            <Button icon={<ArrowLeftOutlined />}>Voltar</Button>
          </Link>
          <Typography.Title level={3} style={{ margin: '12px 0 0 0' }}>
            {data?.project.name ?? 'Business Case do Projeto'}
          </Typography.Title>
          <Typography.Text type="secondary">
            {data ? `${data.project.client} - ${data.project.projectType}` : 'Carregando dados do projeto...'}
          </Typography.Text>
        </div>
        {data ? <HealthBadge status={data.health.status} /> : null}
      </Space>

      {businessCaseQuery.isError ? (
        <Alert type="error" showIcon title={getApiErrorMessage(businessCaseQuery.error, 'Falha ao carregar business case')} />
      ) : null}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <KPICard title="Receita" value={data ? <CurrencyText value={data.kpis.revenue} strong /> : '-'} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <KPICard title="Custo Total" value={data ? <CurrencyText value={data.kpis.totalRealCost} /> : '-'} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <KPICard title="Margem Real" value={data ? <CurrencyText value={data.kpis.margin} /> : '-'} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <KPICard title="Margem %" value={data ? <PercentageText value={data.kpis.marginPercentage} withColor /> : '-'} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <KPICard title="CPI" value={data ? numberOrDash(data.kpis.cpi) : '-'} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <KPICard title="SPI" value={data ? numberOrDash(data.kpis.spi) : '-'} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <KPICard title="Desvio de Prazo" value={data ? <PercentageText value={data.kpis.scheduleDeviation} withColor /> : '-'} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <KPICard title="Desvio de Horas" value={data ? <PercentageText value={data.kpis.hoursDeviation} withColor /> : '-'} />
        </Col>
      </Row>

      <Card title="Distribuicao de custos por area">
        {data && data.costsByArea.length > 0 ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={14}>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={data.costsByArea}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="areaName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="actualCost" fill="#1677ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Col>
            <Col xs={24} xl={10}>
              <Table
                rowKey="areaId"
                pagination={false}
                dataSource={data.costsByArea}
                columns={[
                  { title: 'Area', dataIndex: 'areaName', key: 'areaName' },
                  { title: 'Custo Planejado', key: 'plannedCost', render: (_: unknown, row: (typeof data.costsByArea)[number]) => formatCurrencyBRL(row.plannedCost) },
                  { title: 'Custo Real', key: 'actualCost', render: (_: unknown, row: (typeof data.costsByArea)[number]) => formatCurrencyBRL(row.actualCost) },
                ]}
              />
            </Col>
          </Row>
        ) : (
          <EmptyState description="Sem alocacoes para compor custos por area" />
        )}
      </Card>

      <Card title="Custo por profissional">
        <Table
          rowKey="professionalId"
          loading={businessCaseQuery.isLoading}
          dataSource={data?.costsByProfessional ?? []}
          columns={professionalColumns}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card title="Prazo e performance">
            <Space direction="vertical">
              <Typography.Text>Prazo planejado: {data ? `${formatDate(data.project.plannedStartDate)} - ${formatDate(data.project.plannedEndDate)}` : '-'}</Typography.Text>
              <Typography.Text>
                Prazo real:{' '}
                {data && data.project.actualStartDate && data.project.actualEndDate
                  ? `${formatDate(data.project.actualStartDate)} - ${formatDate(data.project.actualEndDate)}`
                  : '-'}
              </Typography.Text>
              <Typography.Text>Duracao planejada: {data?.kpis.plannedDays ?? '-'} dias</Typography.Text>
              <Typography.Text>Duracao real: {data?.kpis.realDays ?? '-'} dias</Typography.Text>
              <Typography.Text>Desvio: {data ? percentageOrDash(data.kpis.scheduleDeviation) : '-'}</Typography.Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title="Analise de desvios">
            <Typography.Paragraph>{deviationsAnalysis || 'Sem dados suficientes para analise de desvios.'}</Typography.Paragraph>
            <Typography.Text type="secondary">{data?.project.notes ?? 'Sem observacoes adicionais registradas.'}</Typography.Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card title="Avaliacao estrategica">
            <Table
              rowKey="key"
              pagination={false}
              dataSource={strategicRows}
              columns={[
                { title: 'Criterio', dataIndex: 'label', key: 'label' },
                { title: 'Nota', dataIndex: 'value', key: 'value' },
              ]}
            />
            <Statistic title="Score Final" value={data?.strategic.score ?? '-'} style={{ marginTop: 16 }} />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title="Conclusao executiva">
            <Typography.Paragraph>{data?.project.executiveConclusion ?? 'Sem conclusao executiva registrada para este projeto.'}</Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
