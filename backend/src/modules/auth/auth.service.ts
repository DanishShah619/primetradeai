import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import type { RegisterInput, LoginInput, RefreshInput } from './auth.dto';

function signAccessToken(userId: string, email: string, role: string) {
  return jwt.sign({ sub: userId, email, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict('Email already registered');

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return user;
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  const accessToken = signAccessToken(user.id, user.email, user.role);
  const refreshToken = signRefreshToken(user.id);

  // Persist refresh token — enables rotation and revocation
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function refresh(input: RefreshInput) {
  // 1. Verify the JWT signature
  let payload: { sub: string };
  try {
    payload = jwt.verify(input.refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  // 2. Check it exists in DB (guards against already-rotated tokens)
  const stored = await prisma.refreshToken.findUnique({
    where: { token: input.refreshToken },
    include: { user: true },
  });
  if (!stored || stored.userId !== payload.sub) {
    throw ApiError.unauthorized('Refresh token reuse detected — please log in again');
  }

  // 3. Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const newAccessToken = signAccessToken(stored.user.id, stored.user.email, stored.user.role);
  const newRefreshToken = signRefreshToken(stored.user.id);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: stored.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}
