import { Button, Layout, Menu, Typography } from 'antd';
import { BarChartOutlined, ProjectOutlined, TeamOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { clearSession } from '../../services/session';

const { Header, Sider, Content } = Layout;

const items = [
  { key: '/', icon: <BarChartOutlined />, label: <Link to="/">Dashboard</Link> },
  { key: '/projects', icon: <ProjectOutlined />, label: <Link to="/projects">Projetos</Link> },
  { key: '/professionals', icon: <TeamOutlined />, label: <Link to="/professionals">Profissionais</Link> },
  { key: '/areas', icon: <AppstoreOutlined />, label: <Link to="/areas">Areas</Link> },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const selectedKey = location.pathname.startsWith('/projects')
    ? '/projects'
    : location.pathname.startsWith('/professionals')
      ? '/professionals'
      : location.pathname.startsWith('/areas')
        ? '/areas'
        : '/';

  const handleLogout = async (): Promise<void> => {
    clearSession();
    await queryClient.clear();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f2f5fa' }}>
      <Sider theme="light" width={240} style={{ borderRight: '1px solid #eef2f7' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Project Business Case
          </Typography.Title>
        </div>
        <Menu mode="inline" selectedKeys={[selectedKey]} items={items} style={{ borderInlineEnd: 0 }} />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            borderBottom: '1px solid #eef2f7',
            paddingInline: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography.Text strong>Painel Executivo</Typography.Text>
          <Button onClick={() => void handleLogout()}>Sair</Button>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
