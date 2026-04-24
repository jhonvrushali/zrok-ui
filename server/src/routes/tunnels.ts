// src/routes/tunnels.ts
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createTunnel,
  listTunnels,
  getTunnel,
  deleteTunnel,
  getAllActiveTunnels,
} from '../services/tunnelRegistry';
import { AppError } from '../utils/errors';
import dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);

const router = Router();

// All tunnel routes require auth
router.use(authMiddleware);

const CreateTunnelBody = z.object({
  localPort: z.number().int().min(1).max(65535),
  protocol: z.enum(['http', 'tcp']).default('http'),
  customDomain: z.string().min(3).max(255).optional(),
});

// POST /api/tunnels — create a new tunnel
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CreateTunnelBody.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        `Invalid body: ${parsed.error.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }

    const { localPort, protocol, customDomain } = parsed.data;
    const userId = req.authToken!.userId;

    const tunnel = await createTunnel(userId, localPort, protocol, customDomain);

    res.status(201).json({ success: true, data: tunnel });
  } catch (err) {
    next(err);
  }
});

// GET /api/tunnels — list active tunnels for authenticated user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tunnels = await listTunnels(req.authToken!.userId);
    res.json({ success: true, data: tunnels });
  } catch (err) {
    next(err);
  }
});

// GET /api/tunnels/:id/status — get tunnel status
router.get('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tunnel = await getTunnel(req.params.id);
    if (tunnel.userId !== req.authToken!.userId) {
      throw new AppError('Forbidden', 403);
    }
    res.json({ success: true, data: { id: tunnel.id, status: tunnel.status, publicUrl: tunnel.publicUrl } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tunnels/:id — close a tunnel
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tunnel = await deleteTunnel(req.params.id, req.authToken!.userId);

    res.json({ success: true, data: { message: 'Tunnel closed', id: tunnel.id } });
  } catch (err) {
    next(err);
  }
});

// GET /api/tunnels/:id/analytics — get traffic analytics
router.get('/:id/analytics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tunnel = await getTunnel(req.params.id);
    if (tunnel.userId !== req.authToken!.userId) {
      throw new AppError('Forbidden', 403);
    }
    // Mock analytics logic (In production, fetch from Zrok InfluxDB metrics)
    const today = new Date().toISOString().split('T')[0];
    const mockData = Array.from({ length: 7 }).map((_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      bytesIn: Math.floor(Math.random() * 5000000) + 100000,
      bytesOut: Math.floor(Math.random() * 8000000) + 200000,
    })).reverse();

    res.json({ success: true, data: mockData });
  } catch (err) {
    next(err);
  }
});

// POST /api/tunnels/verify-domain — verify custom domain DNS
router.post('/verify-domain', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domain } = req.body;
    if (!domain) throw new AppError('Domain is required', 400);

    // To verify, check if the domain has a CNAME pointing to our zrok instance
    let isVerified = false;
    try {
      const cnames = await resolveCname(domain);
      // E.g. Check if CNAME points to *.share.zrok.io
      if (cnames.some(c => c.includes('nip.io') || c.includes('zrok.io'))) {
        isVerified = true;
      }
    } catch (e) {
      // DNS resolution failed or no CNAME
      isVerified = false;
    }

    // For testing purposes on localhost, we can mock verification if it's a nip.io domain
    if (domain.includes('nip.io')) isVerified = true;

    res.json({ success: true, data: { verified: isVerified, domain } });
  } catch (err) {
    next(err);
  }
});

export default router;
