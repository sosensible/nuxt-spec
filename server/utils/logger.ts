/**
 * Server Logging Utility
 * 
 * Provides structured logging for server-side operations with context
 * including request IDs, operator IDs, and audit trails.
 */

import type { H3Event } from 'h3'

export interface LogContext {
  requestId?: string
  operatorId?: string
  action?: string
  targetUserId?: string
  metadata?: Record<string, unknown>
}

/**
 * Log levels
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

/**
 * Format log message with context
 */
function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const contextStr = context ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

/**
 * Log information message
 */
export function logInfo(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV !== 'test') {
    console.log(formatLog('info', message, context))
  }
}

/**
 * Log warning message
 */
export function logWarn(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV !== 'test') {
    console.warn(formatLog('warn', message, context))
  }
}

/**
 * Log error message
 */
export function logError(message: string, error?: unknown, context?: LogContext): void {
  if (process.env.NODE_ENV !== 'test') {
    const errorDetails = error instanceof Error ? { error: error.message, stack: error.stack } : { error }
    console.error(formatLog('error', message, { ...context, ...errorDetails }))
  }
}

/**
 * Log debug message (only in development)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development' || process.env.AUTH_DEBUG === 'true') {
    console.debug(formatLog('debug', message, context))
  }
}

/**
 * Log admin action for audit trail
 */
export function logAdminAction(
  action: string,
  operatorId: string,
  requestId: string,
  metadata?: Record<string, unknown>
): void {
  logInfo(`Admin action: ${action}`, {
    requestId,
    operatorId,
    action,
    metadata,
  })
}

/**
 * Create logger context from H3 event
 */
export function createLogContext(event: H3Event, operatorId?: string): LogContext {
  const requestId = getHeader(event, 'x-request-id') || `req_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  return {
    requestId,
    operatorId,
    action: `${event.method} ${event.path}`,
  }
}
