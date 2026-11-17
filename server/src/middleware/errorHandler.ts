import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request is invalid',
        details: { issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) },
      },
    });
    return;
  }
  console.error('[error]', err);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong' } });
}
