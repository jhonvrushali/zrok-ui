// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../services/tokenService';
import { AuthToken } from '../models/token';

// Extend Express Request to carry the authenticated token
declare global {
  namespace Express {
    interface Request {
      authToken?: AuthToken;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing Bearer token' });
    return;
  }

  const tokenValue = authHeader.slice(7);

  try {
    req.authToken = await validateToken(tokenValue);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or revoked token' });
  }
}
