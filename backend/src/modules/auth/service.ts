import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/app-error';
import type { LoginInput } from './validation';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError('Credenciais invalidas', 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError('Credenciais invalidas', 401);
  }

  const expiresIn = env.JWT_EXPIRES_IN as SignOptions['expiresIn'];

  const accessToken = jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getAuthenticatedUser(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('Usuario nao encontrado', 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
