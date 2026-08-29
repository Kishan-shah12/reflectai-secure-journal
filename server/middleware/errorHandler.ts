import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: string;
}

/**
 * Centralized, privacy-safe error handling middleware.
 * Ensures no stack traces, credentials, internal file paths, or private journal text leak to the client.
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  const statusCode = typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600
    ? err.statusCode
    : 500;

  // Safe error logging without sensitive payload contents
  const reqId = (req as any).requestId || 'req-' + Math.random().toString(36).substring(2, 9);
  console.error(`[Error] [${reqId}] ${req.method} ${req.originalUrl || req.url} - Status: ${statusCode} - ${err.message || 'Unknown Error'}`);

  let clientMessage = 'Something went wrong. Please try again.';

  if (statusCode === 400) {
    clientMessage = err.message || 'Invalid request.';
  } else if (statusCode === 401) {
    clientMessage = err.message || 'Authentication required.';
  } else if (statusCode === 403) {
    clientMessage = 'Access denied.';
  } else if (statusCode === 404) {
    clientMessage = 'Resource not found.';
  } else if (statusCode === 429) {
    clientMessage = 'Too many requests. Please try again shortly.';
  } else if (statusCode === 502 || statusCode === 503) {
    clientMessage = 'AI service temporarily unavailable. Please try again.';
  }

  res.status(statusCode).json({
    error: clientMessage,
    ...(err.details && statusCode === 400 ? { details: err.details } : {}),
    requestId: reqId,
  });
}
