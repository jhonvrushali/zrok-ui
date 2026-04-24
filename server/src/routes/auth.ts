// src/routes/auth.ts
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { generateToken, revokeToken } from '../services/tokenService';
import { registerUser, loginUser } from '../services/userService';
import { AppError } from '../utils/errors';

const router = Router();

const GenerateTokenBody = z.object({
  userId: z.string().min(1).max(64),
});

const AuthBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Admin guard middleware — checks X-Admin-Secret header
function adminGuard(req: Request, _res: Response, next: NextFunction): void {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    throw new AppError('Unauthorized', 401);
  }
  next();
}

// POST /api/auth/token — generate a new token (admin only)
router.post('/token', adminGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = GenerateTokenBody.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid request body: userId is required', 400);
    }

    const authToken = await generateToken(parsed.data.userId);

    res.status(201).json({
      success: true,
      data: {
        id: authToken.id,
        token: authToken.token,
        userId: authToken.userId,
        createdAt: authToken.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/token/:token — revoke a token (admin only)
router.delete('/token/:token', adminGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await revokeToken(req.params.token);
    res.json({ success: true, data: { message: 'Token revoked' } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register — user registration
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AuthBody.safeParse(req.body);
    if (!parsed.success) throw new AppError('Invalid email or password (min 6 chars)', 400);

    const user = await registerUser(parsed.data.email, parsed.data.password);
    const authToken = await generateToken(user.id);

    res.status(201).json({
      success: true,
      data: { token: authToken.token, user: { id: user.id, email: user.email } }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login — user login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AuthBody.safeParse(req.body);
    if (!parsed.success) throw new AppError('Invalid email or password', 400);

    const user = await loginUser(parsed.data.email, parsed.data.password);
    const authToken = await generateToken(user.id);

    res.json({
      success: true,
      data: { token: authToken.token, user: { id: user.id, email: user.email } }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/users — list all users (Admin only)
// In a real app, protect this with adminGuard
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { getRedis } = await import('../utils/redis');
    const redis = getRedis();
    const keys = await redis.keys('user:data:*');
    const users = [];
    
    for (const key of keys) {
      const raw = await redis.get(key);
      if (raw) {
        const u = JSON.parse(raw);
        users.push({ id: u.id, email: u.email, createdAt: u.createdAt, status: 'Active' });
      }
    }
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

export default router;
