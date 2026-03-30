import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { ProtectedRoute } from '../../components/common/ProtectedRoute';
import { PageLoader } from '../../components/common/PageLoader';

const LoginPage = lazy(() => import('../../pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('../../pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const AreasPage = lazy(() => import('../../pages/areas/AreasPage').then((module) => ({ default: module.AreasPage })));
const ProfessionalsPage = lazy(() =>
  import('../../pages/professionals/ProfessionalsPage').then((module) => ({ default: module.ProfessionalsPage })),
);
const ProjectsPage = lazy(() => import('../../pages/projects/ProjectsPage').then((module) => ({ default: module.ProjectsPage })));
const ProjectAllocationsPage = lazy(() =>
  import('../../pages/projects/ProjectAllocationsPage').then((module) => ({ default: module.ProjectAllocationsPage })),
);
const ProjectBusinessCasePage = lazy(() =>
  import('../../pages/projects/ProjectBusinessCasePage').then((module) => ({ default: module.ProjectBusinessCasePage })),
);

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectBusinessCasePage />} />
            <Route path="/projects/:projectId/allocations" element={<ProjectAllocationsPage />} />
            <Route path="/professionals" element={<ProfessionalsPage />} />
            <Route path="/areas" element={<AreasPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
