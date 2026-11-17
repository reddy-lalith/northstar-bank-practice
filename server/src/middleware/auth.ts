import type { NextFunction, Request, Response } from 'express';
import { sessionRepo } from '../repositories/sessionRepo';
import { unauthorized } from '../utils/errors';
import { config } from '../config';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized());
  }
  const session = sessionRepo.find(token);
  if (!session) {
    return next(unauthorized('Session expired, please log in again'));
  }
  const ageHours = (Date.now() - new Date(session.createdAt).getTime()) / 3_600_000;
  if (ageHours > config.sessionTtlHours) {
    sessionRepo.delete(token);
    return next(unauthorized('Session expired, please log in again'));
  }
  req.userId = session.userId;
  next();
}

export function currentUserId(req: Request): string {
  if (!req.userId) throw unauthorized();
  return req.userId;
}
