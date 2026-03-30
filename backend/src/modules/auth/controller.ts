import type { Request, Response } from 'express';
import { loginSchema } from './validation';
import * as authService from './service';

export async function login(req: Request, res: Response): Promise<Response> {
  const payload = loginSchema.parse(req.body);
  const result = await authService.login(payload);

  return res.status(200).json(result);
}

export async function me(req: Request, res: Response): Promise<Response> {
  const user = await authService.getAuthenticatedUser(req.user!.id);

  return res.status(200).json({ user });
}
