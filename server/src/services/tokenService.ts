// src/services/tokenService.ts
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getRedis } from '../utils/redis';
import { AuthToken } from '../models/token';
import { AppError } from '../utils/errors';

const PREFIX = 'token:';

function tokenKey(tokenValue: string): string {
  return `${PREFIX}${tokenValue}`;
}

export async function generateToken(userId: string): Promise<AuthToken> {
  const redis = getRedis();

  const token: AuthToken = {
    id: uuidv4(),
    userId,
    token: randomBytes(32).toString('hex'),
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    isActive: true,
  };

  await redis.set(tokenKey(token.token), JSON.stringify(token));
  return token;
}

export async function validateToken(tokenValue: string): Promise<AuthToken> {
  const redis = getRedis();
  const raw = await redis.get(tokenKey(tokenValue));

  if (!raw) throw new AppError('Invalid or expired token', 401);

  const authToken: AuthToken = JSON.parse(raw) as AuthToken;
  if (!authToken.isActive) throw new AppError('Token is revoked', 401);

  // Update lastUsedAt
  authToken.lastUsedAt = new Date().toISOString();
  await redis.set(tokenKey(tokenValue), JSON.stringify(authToken));

  return authToken;
}

export async function revokeToken(tokenValue: string): Promise<void> {
  const redis = getRedis();
  const raw = await redis.get(tokenKey(tokenValue));
  if (!raw) throw new AppError('Token not found', 404);

  const authToken: AuthToken = JSON.parse(raw) as AuthToken;
  authToken.isActive = false;
  await redis.set(tokenKey(tokenValue), JSON.stringify(authToken));
}
