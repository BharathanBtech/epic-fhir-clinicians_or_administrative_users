import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { getConfig } from '../config/index.js';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  
  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const config = getConfig();
  
  // Log the error
  logger.error('Unhandled error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    sessionId: req.sessionID
  });
  
  // Determine if it's an operational error
  const isOperational = error instanceof AppError ? error.isOperational : false;
  
  // Send error response
  if (isOperational) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    res.status(statusCode).json({
      error: error.message,
      statusCode,
      timestamp: new Date().toISOString()
    });
  } else {
    // For non-operational errors, don't expose internal details
    res.status(500).json({
      error: config.enableDetailedErrorMessages ? error.message : 'Internal server error',
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 404 handler middleware
 */
export function notFoundHandler(req: Request, res: Response): void {
  logger.warn('Route not found:', { path: req.path, method: req.method });
  
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
