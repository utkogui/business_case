import { Router } from 'express';
import { ensureAuthenticated } from '../../middlewares/auth';
import * as authController from './controller';

export const authRoutes = Router();

authRoutes.post('/login', authController.login);
authRoutes.get('/me', ensureAuthenticated, authController.me);
