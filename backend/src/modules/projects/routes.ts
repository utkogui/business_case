import { Router } from 'express';
import * as controller from './controller';

export const projectsRoutes = Router();

projectsRoutes.get('/', controller.list);
projectsRoutes.post('/', controller.create);
projectsRoutes.get('/:id/business-case', controller.businessCase);
projectsRoutes.get('/:id', controller.getById);
projectsRoutes.put('/:id', controller.update);
projectsRoutes.delete('/:id', controller.remove);
