import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tag, Typography, message } from 'antd';
import type { ContractType, Professional } from '../../types/entities';
import { createProfessional, deleteProfessional, getProfessionals, updateProfessional } from '../../services/professionals';
import { getAreas } from '../../services/areas';
import { formatCurrencyBRL } from '../../utils/formatters';
import { getApiErrorMessage } from '../../utils/http';
import { EmptyState } from '../../components/common/EmptyState';

type ProfessionalFormValues = {
  name: string;
  email?: string;
  roleTitle: string;
  contractType: ContractType;
  monthlyCost: number;
  monthlyHours: number;
  overheadRate: number;
  areaId: string;
  isActive: boolean;
};

const contractTypeOptions: { label: string; value: ContractType }[] = [
  { label: 'CLT', value: 'CLT' },
  { label: 'PJ', value: 'PJ' },
  { label: 'Socio', value: 'PARTNER' },
  { label: 'Freelancer', value: 'FREELANCER' },
];

export function ProfessionalsPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ProfessionalFormValues>();
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const professionalsQuery = useQuery({
    queryKey: ['professionals'],
    queryFn: getProfessionals,
  });

  const areasQuery = useQuery({
    queryKey: ['areas'],
    queryFn: getAreas,
  });

  const monthlyCost = Form.useWatch('monthlyCost', form);
  const monthlyHours = Form.useWatch('monthlyHours', form);
  const overheadRate = Form.useWatch('overheadRate', form);

  const hourlyPreview = useMemo(() => {
    if (!monthlyCost || !monthlyHours || monthlyHours <= 0) return null;
    return monthlyCost / monthlyHours + (overheadRate ?? 0);
  }, [monthlyCost, monthlyHours, overheadRate]);

  const createMutation = useMutation({
    mutationFn: createProfessional,
    onSuccess: async () => {
      message.success('Profissional criado com sucesso');
      setIsModalOpen(false);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Falha ao criar profissional')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProfessionalFormValues> }) => updateProfessional(id, payload),
    onSuccess: async () => {
      message.success('Profissional atualizado com sucesso');
      setIsModalOpen(false);
      setEditingProfessional(null);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Falha ao atualizar profissional')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProfessional,
    onSuccess: async () => {
      message.success('Profissional removido com sucesso');
      await queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Falha ao remover profissional')),
  });

  const columns = useMemo(
    () => [
      { title: 'Nome', dataIndex: 'name', key: 'name' },
      { title: 'Cargo', dataIndex: 'roleTitle', key: 'roleTitle' },
      { title: 'Area', key: 'area', render: (_: unknown, record: Professional) => record.area?.name ?? '-' },
      { title: 'Vinculo', dataIndex: 'contractType', key: 'contractType' },
      { title: 'Custo Hora', key: 'hourlyCost', render: (_: unknown, record: Professional) => formatCurrencyBRL(record.hourlyCost) },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (value: boolean) => <Tag color={value ? 'green' : 'default'}>{value ? 'Ativo' : 'Inativo'}</Tag>,
      },
      {
        title: 'Acoes',
        key: 'actions',
        render: (_: unknown, record: Professional) => (
          <Space>
            <Button
              onClick={() => {
                setEditingProfessional(record);
                form.setFieldsValue({
                  name: record.name,
                  email: record.email ?? undefined,
                  roleTitle: record.roleTitle,
                  contractType: record.contractType,
                  monthlyCost: Number(record.monthlyCost),
                  monthlyHours: Number(record.monthlyHours),
                  overheadRate: Number(record.overheadRate),
                  areaId: record.areaId,
                  isActive: record.isActive,
                });
                setIsModalOpen(true);
              }}
            >
              Editar
            </Button>
            <Popconfirm title="Excluir profissional?" onConfirm={() => deleteMutation.mutate(record.id)}>
              <Button danger>Excluir</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation, form],
  );

  const handleSubmit = async (values: ProfessionalFormValues): Promise<void> => {
    if (editingProfessional) {
      await updateMutation.mutateAsync({ id: editingProfessional.id, payload: values });
      return;
    }
    await createMutation.mutateAsync(values);
  };

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Profissionais
        </Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            setEditingProfessional(null);
            form.resetFields();
            form.setFieldsValue({ contractType: 'CLT', isActive: true });
            setIsModalOpen(true);
          }}
        >
          Novo Profissional
        </Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={professionalsQuery.data ?? []}
        loading={professionalsQuery.isLoading}
        locale={{ emptyText: <EmptyState description="Nenhum profissional cadastrado" /> }}
      />
      {professionalsQuery.isError ? (
        <Alert type="error" showIcon title={getApiErrorMessage(professionalsQuery.error, 'Falha ao carregar profissionais')} />
      ) : null}

      <Modal
        title={editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => void form.submit()}
        okButtonProps={{ loading: createMutation.isPending || updateMutation.isPending }}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ contractType: 'CLT', isActive: true }}>
          <Form.Item label="Nome" name="name" rules={[{ required: true, min: 2 }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Cargo" name="roleTitle" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Tipo de Vinculo" name="contractType" rules={[{ required: true }]}>
            <Select options={contractTypeOptions} />
          </Form.Item>
          <Form.Item label="Area" name="areaId" rules={[{ required: true }]}>
            <Select
              options={(areasQuery.data ?? []).map((area) => ({
                label: area.name,
                value: area.id,
              }))}
            />
          </Form.Item>
          <Form.Item label="Custo Mensal" name="monthlyCost" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item label="Carga Horaria Mensal" name="monthlyHours" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} precision={2} />
          </Form.Item>
          <Form.Item label="Rateio Estrutural" name="overheadRate" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>

          <Typography.Text type="secondary">
            Custo hora estimado: {hourlyPreview ? formatCurrencyBRL(hourlyPreview) : '-'}
          </Typography.Text>

          <Form.Item label="Ativo" name="isActive" valuePropName="checked" style={{ marginTop: 12 }}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
