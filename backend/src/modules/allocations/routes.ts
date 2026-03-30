import { Router } from 'express';
import * as controller from './controller';

export const allocationsRoutes = Router({ mergeParams: true });

allocationsRoutes.get('/', controller.list);
allocationsRoutes.post('/', controller.create);
allocationsRoutes.put('/:allocationId', controller.update);
allocationsRoutes.delete('/:allocationId', controller.remove);
