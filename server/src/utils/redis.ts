// src/utils/redis.ts
import Redis from 'ioredis';
import { logger } from './logger';

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis({
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD ?? undefined,
      lazyConnect: true,
    });

    client.on('connect', () => logger.info('Redis connected'));
    client.on('error', (err) => logger.error('Redis error', { err }));
  }
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
