import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../../services/auth';
import { getAccessToken, setAccessToken } from '../../services/session';
import type { LoginPayload } from '../../types/auth';
import { getApiErrorMessage } from '../../utils/http';

type LoginForm = {
  email: string;
  password: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const token = getAccessToken();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: async (response) => {
      setAccessToken(response.accessToken);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      navigate('/', { replace: true });
    },
    onError: (error) => {
      setError(getApiErrorMessage(error, 'Falha ao autenticar. Verifique API e credenciais.'));
    },
  });

  const handleSubmit = async (values: LoginForm): Promise<void> => {
    setError(null);
    await loginMutation.mutateAsync(values);
  };

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f5f7fb',
        padding: 24,
      }}
    >
      <Card style={{ width: 420, maxWidth: '100%' }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Project Business Case
        </Typography.Title>
        <Typography.Paragraph type="secondary">Acesse o painel interno de analise de projetos.</Typography.Paragraph>

        {error ? <Alert style={{ marginBottom: 16 }} type="error" showIcon title={error} /> : null}

        <Form<LoginForm> layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item label="E-mail" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="admin@businesscase.com" />
          </Form.Item>

          <Form.Item label="Senha" name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="********" />
          </Form.Item>

          <Button block type="primary" htmlType="submit" loading={loginMutation.isPending}>
            Entrar
          </Button>
        </Form>
      </Card>
    </div>
  );
}
