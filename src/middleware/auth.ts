import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Middleware to check if user is authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const tokenData = (req as any).session?.token;
  const patientId = (req as any).session?.patientId;
  
  if (!tokenData || !tokenData.access_token) {
    logger.auth('authentication_required', { sessionId: req.sessionID });
    res.status(401).json({ error: 'Authentication required. Please login first.' });
    return;
  }
  
  if (!patientId) {
    logger.auth('patient_context_missing', { sessionId: req.sessionID });
    res.status(400).json({ error: 'Patient context missing. Please select a patient first.' });
    return;
  }
  
  logger.auth('authentication_valid', { sessionId: req.sessionID, patientId });
  next();
}

/**
 * Middleware to validate session
 */
export function validateSession(req: Request, res: Response, next: NextFunction): void {
  if (!req.session) {
    logger.error('Session middleware not configured');
    res.status(500).json({ error: 'Session configuration error' });
    return;
  }
  
  next();
}

/**
 * Middleware to log requests
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
}
