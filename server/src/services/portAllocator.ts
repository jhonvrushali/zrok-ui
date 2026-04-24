// src/services/portAllocator.ts
import { getRedis } from '../utils/redis';
import { AppError } from '../utils/errors';

const REDIS_KEY = 'ports:used';

const PORT_START = Number(process.env.PORT_RANGE_START ?? 9001);
const PORT_END   = Number(process.env.PORT_RANGE_END   ?? 9999);

export async function allocatePort(): Promise<number> {
  const redis = getRedis();

  for (let port = PORT_START; port <= PORT_END; port++) {
    // SETNX — only sets if key doesn't exist (atomic)
    const acquired = await redis.sadd(REDIS_KEY, port);
    if (acquired === 1) return port;
  }

  throw new AppError('No free ports available. Try again later.', 503);
}

export async function releasePort(port: number): Promise<void> {
  const redis = getRedis();
  await redis.srem(REDIS_KEY, port);
}

export async function isPortInUse(port: number): Promise<boolean> {
  const redis = getRedis();
  return (await redis.sismember(REDIS_KEY, port)) === 1;
}
