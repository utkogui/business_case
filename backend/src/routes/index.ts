import { Router } from 'express';
import { allocationsRoutes } from '../modules/allocations/routes';
import { areasRoutes } from '../modules/areas/routes';
import { authRoutes } from '../modules/auth/routes';
import { dashboardRoutes } from '../modules/dashboard/routes';
import { professionalsRoutes } from '../modules/professionals/routes';
import { projectsRoutes } from '../modules/projects/routes';
import { ensureAuthenticated } from '../middlewares/auth';

export const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use(ensureAuthenticated);
apiRouter.use('/areas', areasRoutes);
apiRouter.use('/professionals', professionalsRoutes);
apiRouter.use('/projects', projectsRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

// Rotas aninhadas principais de alocacoes.
apiRouter.use('/projects/:projectId/allocations', allocationsRoutes);
