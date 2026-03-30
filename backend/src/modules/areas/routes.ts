import { Router } from 'express';
import * as controller from './controller';

export const areasRoutes = Router();

areasRoutes.get('/', controller.list);
areasRoutes.post('/', controller.create);
areasRoutes.get('/:id', controller.getById);
areasRoutes.put('/:id', controller.update);
areasRoutes.delete('/:id', controller.remove);
