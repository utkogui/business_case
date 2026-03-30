import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/app-error';

type TokenPayload = {
  sub: string;
  role: string;
};

export function ensureAuthenticated(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Nao autenticado', 401);
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Formato de token invalido', 401);
  }

  const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

  req.user = {
    id: decoded.sub,
    role: decoded.role,
  };

  next();
}
