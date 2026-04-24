// src/index.ts
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { globalErrorHandler } from './utils/errors';
import { logger } from './utils/logger';
import { getRedis, closeRedis } from './utils/redis';

import authRoutes    from './routes/auth';
import tunnelRoutes  from './routes/tunnels';

const PORT = Number(process.env.PORT ?? 3000);

async function bootstrap(): Promise<void> {
  const app = express();

  // ── Security & Parsing ─────────────────────
  app.use(helmet());
  app.use(express.json());
  
  // Custom request logger to debug proxy connections
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
  
  app.use(morgan('combined'));

  // ── Rate Limiting ──────────────────────────
  app.use(
    rateLimit({
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900_000),
      max: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100),
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // ── Health Check ───────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
  });

  // ── Routes ─────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/tunnels', tunnelRoutes);

  // ── Global Error Handler ───────────────────
  app.use(globalErrorHandler);

  // ── Redis ──────────────────────────────────
  await getRedis().connect();
  logger.info('Redis ready');

  // ── Start Express ──────────────────────────
  app.listen(PORT, '127.0.0.1', () => {
    logger.info(`Zrok API server running on port ${PORT}`);
  });

  // ── Graceful Shutdown ──────────────────────
  async function shutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal} — shutting down gracefully...`);
    await closeRedis();
    logger.info('Shutdown complete');
    process.exit(0);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
