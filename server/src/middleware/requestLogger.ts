import type { NextFunction, Request, Response } from 'express';
import { config } from '../config';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (!config.logRequests) return next();
  const started = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - started;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}
