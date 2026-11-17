export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (code: string, message: string, details?: Record<string, unknown>) =>
  new AppError(400, code, message, details);

export const unauthorized = (message = 'Authentication required') =>
  new AppError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = 'Not allowed') => new AppError(403, 'FORBIDDEN', message);

export const notFound = (entity: string) =>
  new AppError(404, 'NOT_FOUND', `${entity} not found`);

export const unprocessable = (code: string, message: string, details?: Record<string, unknown>) =>
  new AppError(422, code, message, details);
