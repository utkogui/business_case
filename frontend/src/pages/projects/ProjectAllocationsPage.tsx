import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Rate, Select, Space, Table, Typography, message } from 'antd';
import type { Allocation } from '../../types/entities';
import { createAllocation, deleteAllocation, getAllocations, updateAllocation } from '../../services/allocations';
import { getProfessionals } from '../../services/professionals';
import { getProjectById } from '../../services/projects';
import { formatCurrencyBRL } from '../../utils/formatters';
import { getApiErrorMessage } from '../../utils/http';

type AllocationFormValues = {
  professionalId: string;
  areaId?: string;
  plannedHours: number;
  actualHours: number;
  professionalEvaluation?: number;
  notes?: string;
};

export function ProjectAllocationsPage() {
  const { projectId = '' } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
  const [form] = Form.useForm<AllocationFormValues>();
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProjectById(projectId),
    enabled: Boolean(projectId),
  });

  const allocationsQuery = useQuery({
    queryKey: ['projects', projectId, 'allocations'],
    queryFn: () => getAllocations(projectId),
    enabled: Boolean(projectId),
  });

  const professionalsQuery = useQuery({
    queryKey: ['professionals'],
    queryFn: getProfessionals,
  });

  const createMutation = useMutation({
    mutationFn: (payload: AllocationFormValues) => createAllocation(projectId, payload),
    onSuccess: async () => {
      message.success('Alocacao criada com sucesso');
      setIsModalOpen(false);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'allocations'] });
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Falha ao criar alocacao')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AllocationFormValues> }) => updateAllocation(projectId, id, payload),
    onSuccess: async () => {
      message.success('Alocacao atualizada com sucesso');
      setIsModalOpen(false);
      setEditingAllocation(null);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'allocations'] });
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Falha ao atualizar alocacao')),
  });

  const deleteMutation = useMutation({
    mutationFn: (allocationId: string) => deleteAllocation(projectId, allocationId),
    onSuccess: async () => {
      message.success('Alocacao removida com sucesso');
      await queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'allocations'] });
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Falha ao remover alocacao')),
  });

  const professionalOptions = useMemo(
    () =>
      (professionalsQuery.data ?? []).map((professional) => ({
        label: `${professional.name} - ${professional.area?.name ?? 'Sem area'}`,
        value: professional.id,
      })),
    [professionalsQuery.data],
  );

  const columns = [
    { title: 'Profissional', key: 'professional', render: (_: unknown, record: Allocation) => record.professional.name },
    { title: 'Area', key: 'area', render: (_: unknown, record: Allocation) => record.area?.name ?? '-' },
    { title: 'Horas Planejadas', key: 'plannedHours', render: (_: unknown, record: Allocation) => Number(record.plannedHours).toFixed(2) },
    { title: 'Horas Reais', key: 'actualHours', render: (_: unknown, record: Allocation) => Number(record.actualHours).toFixed(2) },
    {
      title: 'Avaliacao',
      key: 'professionalEvaluation',
      render: (_: unknown, record: Allocation) => (record.professionalEvaluation ? <Rate disabled value={record.professionalEvaluation} /> : '-'),
    },
    { title: 'Custo Hora', key: 'hourlyCostSnapshot', render: (_: unknown, record: Allocation) => formatCurrencyBRL(record.hourlyCostSnapshot) },
    { title: 'Custo Real', key: 'actualCost', render: (_: unknown, record: Allocation) => formatCurrencyBRL(record.actualCost) },
    {
      title: 'Acoes',
      key: 'actions',
      render: (_: unknown, record: Allocation) => (
        <Space>
          <Button
            onClick={() => {
              setEditingAllocation(record);
              form.setFieldsValue({
                professionalId: record.professionalId,
                areaId: record.areaId,
                plannedHours: Number(record.plannedHours),
                actualHours: Number(record.actualHours),
                professionalEvaluation: record.professionalEvaluation ?? undefined,
                notes: record.notes ?? undefined,
              });
              setIsModalOpen(true);
            }}
          >
            Editar
          </Button>
          <Popconfirm title="Excluir alocacao?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button danger>Excluir</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values: AllocationFormValues): Promise<void> => {
    if (editingAllocation) {
      await updateMutation.mutateAsync({ id: editingAllocation.id, payload: values });
      return;
    }

    await createMutation.mutateAsync(values);
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <div>
            <Link to="/projects">
              <Button icon={<ArrowLeftOutlined />}>Voltar para projetos</Button>
            </Link>
            <Typography.Title level={4} style={{ marginTop: 12, marginBottom: 0 }}>
              Alocacoes do Projeto
            </Typography.Title>
            <Typography.Text type="secondary">
              {projectQuery.data ? `${projectQuery.data.name} - ${projectQuery.data.client}` : 'Carregando projeto...'}
            </Typography.Text>
          </div>
          <Button
            type="primary"
            onClick={() => {
              setEditingAllocation(null);
              form.resetFields();
              form.setFieldsValue({ plannedHours: 0, actualHours: 0 });
              setIsModalOpen(true);
            }}
          >
            Nova Alocacao
          </Button>
        </Space>

        <Table rowKey="id" columns={columns} dataSource={allocationsQuery.data ?? []} loading={allocationsQuery.isLoading} />
      </Space>

      <Modal
        title={editingAllocation ? 'Editar Alocacao' : 'Nova Alocacao'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => void form.submit()}
        okButtonProps={{ loading: createMutation.isPending || updateMutation.isPending }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ plannedHours: 0, actualHours: 0 }}>
          <Form.Item label="Profissional" name="professionalId" rules={[{ required: true }]}>
            <Select options={professionalOptions} />
          </Form.Item>
          <Form.Item label="Area (opcional)" name="areaId">
            <Select
              allowClear
              options={(professionalsQuery.data ?? []).map((professional) => ({
                value: professional.areaId,
                label: professional.area?.name ?? 'Sem area',
              }))}
            />
          </Form.Item>
          <Form.Item label="Horas Planejadas" name="plannedHours" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item label="Horas Reais" name="actualHours" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item label="Avaliacao do Profissional (1 a 5)" name="professionalEvaluation">
            <Rate />
          </Form.Item>
          <Form.Item label="Observacoes" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
