import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, ColorPicker, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag, Typography, message } from 'antd';
import type { Area } from '../../types/entities';
import { createArea, deleteArea, getAreas, updateArea } from '../../services/areas';
import { getApiErrorMessage } from '../../utils/http';
import { EmptyState } from '../../components/common/EmptyState';

type AreaFormValues = {
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
};

export function AreasPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [form] = Form.useForm<AreaFormValues>();

  const areasQuery = useQuery({
    queryKey: ['areas'],
    queryFn: getAreas,
  });

  const createMutation = useMutation({
    mutationFn: createArea,
    onSuccess: async () => {
      message.success('Area criada com sucesso');
      setIsModalOpen(false);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error, 'Falha ao criar area'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AreaFormValues> }) => updateArea(id, payload),
    onSuccess: async () => {
      message.success('Area atualizada com sucesso');
      setIsModalOpen(false);
      setEditingArea(null);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error, 'Falha ao atualizar area'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArea,
    onSuccess: async () => {
      message.success('Area removida com sucesso');
      await queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error, 'Falha ao remover area'));
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const columns = useMemo(
    () => [
      { title: 'Nome', dataIndex: 'name', key: 'name' },
      { title: 'Descricao', dataIndex: 'description', key: 'description', render: (value: string | null) => value ?? '-' },
      {
        title: 'Cor',
        dataIndex: 'color',
        key: 'color',
        render: (value: string | null) => (value ? <Tag color={value}>{value}</Tag> : '-'),
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (value: boolean) => <Tag color={value ? 'green' : 'default'}>{value ? 'Ativa' : 'Inativa'}</Tag>,
      },
      {
        title: 'Acoes',
        key: 'actions',
        render: (_: unknown, record: Area) => (
          <Space>
            <Button
              onClick={() => {
                setEditingArea(record);
                form.setFieldsValue({
                  name: record.name,
                  description: record.description ?? undefined,
                  color: record.color ?? undefined,
                  isActive: record.isActive,
                });
                setIsModalOpen(true);
              }}
            >
              Editar
            </Button>
            <Popconfirm title="Excluir area?" onConfirm={() => deleteMutation.mutate(record.id)}>
              <Button danger>Excluir</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation, form],
  );

  const handleSubmit = async (values: AreaFormValues): Promise<void> => {
    if (editingArea) {
      await updateMutation.mutateAsync({ id: editingArea.id, payload: values });
      return;
    }

    await createMutation.mutateAsync(values);
  };

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Areas
        </Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            setEditingArea(null);
            form.resetFields();
            form.setFieldsValue({ isActive: true });
            setIsModalOpen(true);
          }}
        >
          Nova Area
        </Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={areasQuery.data ?? []}
        loading={areasQuery.isLoading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: <EmptyState description="Nenhuma area cadastrada" /> }}
      />
      {areasQuery.isError ? <Alert type="error" showIcon title={getApiErrorMessage(areasQuery.error, 'Falha ao carregar areas')} /> : null}

      <Modal
        title={editingArea ? 'Editar Area' : 'Nova Area'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => void form.submit()}
        okButtonProps={{ loading: isSaving }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ isActive: true }}>
          <Form.Item label="Nome" name="name" rules={[{ required: true, min: 2 }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Descricao" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Cor" name="color">
            <ColorPicker
              showText
              format="hex"
              onChange={(_, hex) => {
                form.setFieldValue('color', hex);
              }}
            />
          </Form.Item>
          <Form.Item label="Ativa" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
