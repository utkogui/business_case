import { Router } from 'express';
import * as controller from './controller';

export const dashboardRoutes = Router();

dashboardRoutes.get('/overview', controller.overview);
