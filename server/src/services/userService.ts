import { v4 as uuidv4 } from 'uuid';
import { createHash, randomBytes } from 'crypto';
import { getRedis } from '../utils/redis';
import { AppError } from '../utils/errors';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

const USER_EMAIL_INDEX = 'user:email:';
const USER_DATA = 'user:data:';

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex');
}

export async function registerUser(email: string, password: string): Promise<User> {
  const redis = getRedis();
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await redis.get(`${USER_EMAIL_INDEX}${normalizedEmail}`);
  if (existing) {
    throw new AppError('Email already registered', 400);
  }

  const salt = randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const user: User = {
    id: uuidv4(),
    email: normalizedEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString()
  };

  await redis.set(`${USER_DATA}${user.id}`, JSON.stringify(user));
  await redis.set(`${USER_EMAIL_INDEX}${normalizedEmail}`, user.id);

  return user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const redis = getRedis();
  const normalizedEmail = email.toLowerCase().trim();

  const userId = await redis.get(`${USER_EMAIL_INDEX}${normalizedEmail}`);
  if (!userId) {
    throw new AppError('Invalid email or password', 401);
  }

  const raw = await redis.get(`${USER_DATA}${userId}`);
  if (!raw) {
    throw new AppError('User data not found', 500);
  }

  const user: User = JSON.parse(raw);
  const hash = hashPassword(password, user.salt);

  if (hash !== user.passwordHash) {
    throw new AppError('Invalid email or password', 401);
  }

  return user;
}
