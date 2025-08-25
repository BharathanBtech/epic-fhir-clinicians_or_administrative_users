import { getConfig } from '../config/index.js';

/**
 * Logging levels
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

/**
 * Centralized logging service
 */
export class Logger {
  private static instance: Logger;
  private config = getConfig();
  
  private constructor() {}
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  /**
   * Log error messages
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, '❌ ERROR:', message, ...args);
  }
  
  /**
   * Log warning messages
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, '⚠️  WARN:', message, ...args);
  }
  
  /**
   * Log info messages
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, 'ℹ️  INFO:', message, ...args);
  }
  
  /**
   * Log debug messages (only in development)
   */
  debug(message: string, ...args: any[]): void {
    if (this.config.enableDebugLogging) {
      this.log(LogLevel.DEBUG, '🔍 DEBUG:', message, ...args);
    }
  }
  
  /**
   * Log FHIR API responses
   */
  fhir(operation: string, details: any): void {
    this.debug(`FHIR ${operation}:`, details);
  }
  
  /**
   * Log patient-related operations
   */
  patient(operation: string, patientId: string, details?: any): void {
    this.info(`👤 Patient ${operation}: ${patientId}`, details);
  }
  
  /**
   * Log funding-related operations
   */
  funding(operation: string, details: any): void {
    this.info(`💰 Funding ${operation}:`, details);
  }
  
  /**
   * Log EOB-related operations
   */
  eob(operation: string, eobId: string, details?: any): void {
    this.info(`📋 EOB ${operation}: ${eobId}`, details);
  }
  
  /**
   * Log authentication operations
   */
  auth(operation: string, details?: any): void {
    this.info(`🔐 Auth ${operation}:`, details);
  }
  
  /**
   * Internal logging method
   */
  private log(level: LogLevel, prefix: string, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${prefix} ${message}`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, ...args);
        break;
      case LogLevel.INFO:
        console.log(logMessage, ...args);
        break;
      case LogLevel.DEBUG:
        console.log(logMessage, ...args);
        break;
    }
  }
}

/**
 * Export singleton logger instance
 */
export const logger = Logger.getInstance();
