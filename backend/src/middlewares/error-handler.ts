import type { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/app-error';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Validation error',
      issues: error.flatten(),
    });
    return;
  }

  if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
    res.status(401).json({
      message: 'Token invalido ou expirado',
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({
      message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      ...(env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
    });
    return;
  }

  res.status(500).json({
    message: 'Internal server error',
  });
}
