import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Project, ProjectComplexity, ProjectStatus } from '../../types/entities';
import { createProject, deleteProject, getProjects, updateProject } from '../../services/projects';
import { formatCurrencyBRL } from '../../utils/formatters';
import { getApiErrorMessage } from '../../utils/http';
import { EmptyState } from '../../components/common/EmptyState';

type ProjectFormValues = {
  name: string;
  client: string;
  projectType: string;
  description?: string;
  plannedRevenue: number;
  actualRevenue?: number | null;
  complexity: ProjectComplexity;
  status: ProjectStatus;
  plannedStartDate: dayjs.Dayjs;
  plannedEndDate: dayjs.Dayjs;
  actualStartDate?: dayjs.Dayjs | null;
  actualEndDate?: dayjs.Dayjs | null;
  notes?: string;
  executiveConclusion?: string;
  strategicProfitability?: number | null;
  strategicOrganization?: number | null;
  strategicClient?: number | null;
  strategicFuturePotential?: number | null;
  strategicPortfolio?: number | null;
};

const complexityOptions: { label: string; value: ProjectComplexity }[] = [
  { label: 'Baixa', value: 'LOW' },
  { label: 'Media', value: 'MEDIUM' },
  { label: 'Alta', value: 'HIGH' },
];

const statusOptions: { label: string; value: ProjectStatus }[] = [
  { label: 'Planejamento', value: 'PLANNING' },
  { label: 'Em andamento', value: 'IN_PROGRESS' },
  { label: 'Concluido', value: 'COMPLETED' },
  { label: 'Arquivado', value: 'ARCHIVED' },
];

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ProjectFormValues>();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      message.success('Projeto criado com sucesso');
      setIsModalOpen(false);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Falha ao criar projeto')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateProject>[1] }) => updateProject(id, payload),
    onSuccess: async () => {
      message.success('Projeto atualizado com sucesso');
      setIsModalOpen(false);
      setEditingProject(null);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Falha ao atualizar projeto')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: async () => {
      message.success('Projeto removido com sucesso');
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Falha ao remover projeto')),
  });

  const columns = useMemo(
    () => [
      { title: 'Nome', dataIndex: 'name', key: 'name' },
      { title: 'Cliente', dataIndex: 'client', key: 'client' },
      { title: 'Tipo', dataIndex: 'projectType', key: 'projectType' },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (value: ProjectStatus) => <Tag color={value === 'COMPLETED' ? 'green' : 'blue'}>{value}</Tag>,
      },
      { title: 'Receita Prev.', key: 'plannedRevenue', render: (_: unknown, record: Project) => formatCurrencyBRL(record.plannedRevenue) },
      { title: 'Receita Real', key: 'actualRevenue', render: (_: unknown, record: Project) => (record.actualRevenue ? formatCurrencyBRL(record.actualRevenue) : '-') },
      {
        title: 'Acoes',
        key: 'actions',
        render: (_: unknown, record: Project) => (
          <Space>
            <Button
              onClick={() => {
                setEditingProject(record);
                form.setFieldsValue({
                  name: record.name,
                  client: record.client,
                  projectType: record.projectType,
                  description: record.description ?? undefined,
                  plannedRevenue: Number(record.plannedRevenue),
                  actualRevenue: record.actualRevenue ? Number(record.actualRevenue) : undefined,
                  complexity: record.complexity,
                  status: record.status,
                  plannedStartDate: dayjs(record.plannedStartDate),
                  plannedEndDate: dayjs(record.plannedEndDate),
                  actualStartDate: record.actualStartDate ? dayjs(record.actualStartDate) : null,
                  actualEndDate: record.actualEndDate ? dayjs(record.actualEndDate) : null,
                  notes: record.notes ?? undefined,
                  executiveConclusion: record.executiveConclusion ?? undefined,
                  strategicProfitability: record.strategicProfitability ?? undefined,
                  strategicOrganization: record.strategicOrganization ?? undefined,
                  strategicClient: record.strategicClient ?? undefined,
                  strategicFuturePotential: record.strategicFuturePotential ?? undefined,
                  strategicPortfolio: record.strategicPortfolio ?? undefined,
                });
                setIsModalOpen(true);
              }}
            >
              Editar
            </Button>
            <Link to={`/projects/${record.id}`}>
              <Button type="primary">Dashboard</Button>
            </Link>
            <Link to={`/projects/${record.id}/allocations`}>
              <Button>Alocacoes</Button>
            </Link>
            <Popconfirm title="Excluir projeto?" onConfirm={() => deleteMutation.mutate(record.id)}>
              <Button danger>Excluir</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation, form],
  );

  const handleSubmit = async (values: ProjectFormValues): Promise<void> => {
    const payload = {
      ...values,
      plannedStartDate: values.plannedStartDate.toISOString(),
      plannedEndDate: values.plannedEndDate.toISOString(),
      actualStartDate: values.actualStartDate ? values.actualStartDate.toISOString() : null,
      actualEndDate: values.actualEndDate ? values.actualEndDate.toISOString() : null,
      description: values.description ?? null,
      notes: values.notes ?? null,
      executiveConclusion: values.executiveConclusion ?? null,
      actualRevenue: values.actualRevenue ?? null,
      strategicProfitability: values.strategicProfitability ?? null,
      strategicOrganization: values.strategicOrganization ?? null,
      strategicClient: values.strategicClient ?? null,
      strategicFuturePotential: values.strategicFuturePotential ?? null,
      strategicPortfolio: values.strategicPortfolio ?? null,
    };

    if (editingProject) {
      await updateMutation.mutateAsync({ id: editingProject.id, payload });
      return;
    }

    await createMutation.mutateAsync(payload);
  };

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Projetos
        </Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            setEditingProject(null);
            form.resetFields();
            form.setFieldsValue({ complexity: 'MEDIUM', status: 'PLANNING' });
            setIsModalOpen(true);
          }}
        >
          Novo Projeto
        </Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={projectsQuery.data ?? []}
        loading={projectsQuery.isLoading}
        locale={{ emptyText: <EmptyState description="Nenhum projeto cadastrado" /> }}
      />
      {projectsQuery.isError ? <Alert type="error" showIcon title={getApiErrorMessage(projectsQuery.error, 'Falha ao carregar projetos')} /> : null}

      <Modal
        title={editingProject ? 'Editar Projeto' : 'Novo Projeto'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => void form.submit()}
        okButtonProps={{ loading: createMutation.isPending || updateMutation.isPending }}
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Cliente" name="client" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Tipo de Projeto" name="projectType" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Descricao" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Receita Prevista" name="plannedRevenue" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item label="Receita Real" name="actualRevenue">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item label="Complexidade" name="complexity" rules={[{ required: true }]}>
            <Select options={complexityOptions} />
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Inicio Planejado" name="plannedStartDate" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Fim Planejado" name="plannedEndDate" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Inicio Real" name="actualStartDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Fim Real" name="actualEndDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Notas" name="notes">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Conclusao Executiva" name="executiveConclusion">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
