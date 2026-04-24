// src/services/tunnelRegistry.ts
import { v4 as uuidv4 } from 'uuid';
import { getRedis } from '../utils/redis';
import { Tunnel, TunnelProtocol } from '../models/tunnel';
import { AppError } from '../utils/errors';

const PREFIX = 'tunnel:';
const USER_INDEX = 'tunnels:user:';

const MAX_TUNNELS = Number(process.env.MAX_TUNNELS_PER_TOKEN ?? 3);
const BASE_DOMAIN = process.env.BASE_DOMAIN ?? 'yourdomain.com';
const CHISEL_HOST = process.env.CHISEL_CONNECT_HOST ?? `connect.${BASE_DOMAIN}`;

function tunnelKey(id: string): string { return `${PREFIX}${id}`; }
function userKey(userId: string): string { return `${USER_INDEX}${userId}`; }

export async function createTunnel(
  userId: string,
  localPort: number,
  protocol: TunnelProtocol = 'http',
  customDomain?: string
): Promise<Tunnel> {
  const redis = getRedis();

  // Enforce per-user tunnel limit
  const existingIds = await redis.smembers(userKey(userId));
  if (existingIds.length >= MAX_TUNNELS) {
    throw new AppError(
      `Max ${MAX_TUNNELS} active tunnels allowed per token.`,
      429
    );
  }

  const shareMode = customDomain ? 'custom' : protocol;
  const subdomain = `shr_${Math.random().toString(36).substring(2, 8)}`;
  const domainString = customDomain ? customDomain : `${subdomain}.share.zrok.io`;

  const tunnel: Tunnel = {
    id: uuidv4(),
    userId,
    subdomain,
    customDomain,
    publicUrl: `https://${domainString}`,
    localPort,
    serverPort: 0,
    protocol,
    status: 'active',
    pid: null,
    createdAt: new Date().toISOString(),
    chiselCommand: `zrok share ${protocol === 'tcp' ? 'private' : 'public'} localhost:${localPort}`,
  };

  await redis.set(tunnelKey(tunnel.id), JSON.stringify(tunnel));
  await redis.sadd(userKey(userId), tunnel.id);

  return tunnel;
}

export async function getTunnel(id: string): Promise<Tunnel> {
  const redis = getRedis();
  const raw = await redis.get(tunnelKey(id));
  if (!raw) throw new AppError('Tunnel not found', 404);
  return JSON.parse(raw) as Tunnel;
}

export async function listTunnels(userId: string): Promise<Tunnel[]> {
  const redis = getRedis();
  const ids = await redis.smembers(userKey(userId));

  const tunnels: Tunnel[] = [];
  for (const id of ids) {
    const raw = await redis.get(tunnelKey(id));
    if (raw) tunnels.push(JSON.parse(raw) as Tunnel);
  }

  return tunnels.filter((t) => t.status === 'active');
}

export async function deleteTunnel(id: string, userId: string): Promise<Tunnel> {
  const redis = getRedis();
  const tunnel = await getTunnel(id);

  if (tunnel.userId !== userId) throw new AppError('Forbidden', 403);

  await redis.del(tunnelKey(id));
  await redis.srem(userKey(userId), id);

  return tunnel;
}

export async function markInactive(id: string): Promise<void> {
  const redis = getRedis();
  const raw = await redis.get(tunnelKey(id));
  if (!raw) return;

  const tunnel: Tunnel = JSON.parse(raw) as Tunnel;
  tunnel.status = 'inactive';
  await redis.set(tunnelKey(id), JSON.stringify(tunnel));
}

export async function updatePid(id: string, pid: number): Promise<void> {
  const redis = getRedis();
  const raw = await redis.get(tunnelKey(id));
  if (!raw) return;

  const tunnel: Tunnel = JSON.parse(raw) as Tunnel;
  tunnel.pid = pid;
  await redis.set(tunnelKey(id), JSON.stringify(tunnel));
}

export async function getAllActiveTunnels(): Promise<Tunnel[]> {
  const redis = getRedis();
  const keys = await redis.keys(`${PREFIX}*`);
  const tunnels: Tunnel[] = [];

  for (const key of keys) {
    const raw = await redis.get(key);
    if (raw) {
      const t = JSON.parse(raw) as Tunnel;
      if (t.status === 'active') tunnels.push(t);
    }
  }

  return tunnels;
}
