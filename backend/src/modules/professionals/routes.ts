import { Router } from 'express';
import * as controller from './controller';

export const professionalsRoutes = Router();

professionalsRoutes.get('/', controller.list);
professionalsRoutes.post('/', controller.create);
professionalsRoutes.get('/:id', controller.getById);
professionalsRoutes.put('/:id', controller.update);
professionalsRoutes.delete('/:id', controller.remove);
