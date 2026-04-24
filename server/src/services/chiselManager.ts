// src/services/chiselManager.ts
import { spawn, ChildProcess } from 'child_process';
import { writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { logger } from '../utils/logger';
import { getAllActiveTunnels, markInactive, updatePid } from './tunnelRegistry';
import { Tunnel } from '../models/tunnel';

const CHISEL_BIN = process.env.CHISEL_BINARY_PATH ?? '/usr/local/bin/chisel';
const CHISEL_PORT = process.env.CHISEL_SERVER_PORT ?? '8080';
const CHISEL_HOST = process.env.CHISEL_SERVER_HOST ?? '0.0.0.0';
const NGINX_MAP   = process.env.NGINX_MAP_FILE ?? '/etc/nginx/tunnel-map.conf';

// Track running processes: tunnelId → ChildProcess
const processes = new Map<string, ChildProcess>();

let healthInterval: NodeJS.Timeout | null = null;

// ── Start the shared Chisel server ──────────────────────
export function startChiselServer(): ChildProcess {
  // Chisel runs as a single server that handles ALL tunnels
  // Auth is handled per-token via the --auth flag
  const args = [
    'server',
    `--host=${CHISEL_HOST}`,
    `--port=${CHISEL_PORT}`,
    '--reverse',
  ];

  logger.info(`Starting chisel server: ${CHISEL_BIN} ${args.join(' ')}`);

  const proc = spawn(CHISEL_BIN, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  proc.stdout?.on('data', (d: Buffer) =>
    logger.debug(`[chisel-server] ${d.toString().trim()}`)
  );
  proc.stderr?.on('data', (d: Buffer) =>
    logger.debug(`[chisel-server] ${d.toString().trim()}`)
  );

  proc.on('exit', (code) =>
    logger.warn(`Chisel server exited with code ${code}`)
  );

  processes.set('__server__', proc);
  return proc;
}

// ── Stop a specific process by PID ──────────────────────
export async function stopProcess(pid: number): Promise<void> {
  try {
    process.kill(pid, 'SIGTERM');
    // Wait up to 5s then force kill
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        try { process.kill(pid, 'SIGKILL'); } catch { /* already dead */ }
        resolve();
      }, 5000);
    });
  } catch {
    // Process already dead — that's fine
  }
}

// ── Kill ALL tracked processes ───────────────────────────
export async function stopAllProcesses(): Promise<void> {
  logger.info('Stopping all chisel processes...');
  for (const [, proc] of processes) {
    if (proc.pid) await stopProcess(proc.pid);
  }
  processes.clear();
}

// ── Write nginx tunnel-map.conf and reload ───────────────
export function reloadNginxMap(tunnels: Tunnel[]): void {
  const lines = tunnels
    .filter((t) => t.status === 'active')
    .map((t) => {
      const host = t.customDomain ? t.customDomain : `${t.subdomain}.${process.env.BASE_DOMAIN ?? 'yourdomain.com'}`;
      return `${host}    ${t.serverPort};`;
    })
    .join('\n');

  try {
    writeFileSync(NGINX_MAP, lines + '\n', 'utf-8');
    execSync('nginx -s reload', { stdio: 'ignore' });
    logger.info(`Nginx map reloaded — ${tunnels.length} tunnel(s) active`);
  } catch (err) {
    logger.warn('Nginx reload failed (may not be installed in dev)', { err });
  }
}

// ── Health check loop ────────────────────────────────────
export function startHealthCheckLoop(): void {
  healthInterval = setInterval(async () => {
    const tunnels = await getAllActiveTunnels();

    for (const tunnel of tunnels) {
      if (!tunnel.pid) continue;

      let alive = false;
      try {
        process.kill(tunnel.pid, 0); // Signal 0 = check existence only
        alive = true;
      } catch {
        alive = false;
      }

      if (!alive) {
        logger.warn(`Tunnel ${tunnel.id} (PID ${tunnel.pid}) is dead — marking inactive`);
        await markInactive(tunnel.id);
      }
    }
  }, 5000);
}

export function stopHealthCheckLoop(): void {
  if (healthInterval) {
    clearInterval(healthInterval);
    healthInterval = null;
  }
}
