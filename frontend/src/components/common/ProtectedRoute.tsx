import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { me } from '../../services/auth';
import { clearSession, getAccessToken } from '../../services/session';

type ProtectedRouteProps = {
  redirectTo?: string;
};

export function ProtectedRoute({ redirectTo = '/login' }: ProtectedRouteProps) {
  const location = useLocation();
  const token = getAccessToken();

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: me,
    enabled: Boolean(token),
    retry: false,
  });

  if (!token) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (meQuery.isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (meQuery.isError) {
    clearSession();
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
