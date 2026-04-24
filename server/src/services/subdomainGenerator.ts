// src/services/subdomainGenerator.ts
import { getRedis } from '../utils/redis';

const REDIS_KEY = 'subdomains:used';
const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const LENGTH = 6;

function randomSubdomain(): string {
  let result = '';
  for (let i = 0; i < LENGTH; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

export async function generateSubdomain(): Promise<string> {
  const redis = getRedis();

  for (let attempt = 0; attempt < 10; attempt++) {
    const sub = randomSubdomain();
    const acquired = await redis.sadd(REDIS_KEY, sub);
    if (acquired === 1) return sub;
  }

  throw new Error('Could not generate a unique subdomain. Please try again.');
}

export async function releaseSubdomain(subdomain: string): Promise<void> {
  const redis = getRedis();
  await redis.srem(REDIS_KEY, subdomain);
}
