import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger, LogContext, RequestLog, ResponseLog } from "../utils/logger.js";
import { AuthenticatedRequest } from "../interfaces/auth.interface.js";

// Extend Request interface to include logging context
declare global {
  namespace Express {
    interface Request {
      logContext?: LogContext;
      startTime?: number;
      session?: any; // Add this line to support req.session
    }
  }
}

/**
 * Main logging middleware that logs all HTTP requests and responses
 */
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = uuidv4();

  // Create log context
  const logContext: LogContext = {
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    userAgent: req.get("User-Agent"),
    ip: req.ip || req.connection.remoteAddress || "unknown",
    timestamp: new Date().toISOString(),
  };

  // Add user info if authenticated
  const authReq = req as AuthenticatedRequest;
  if (authReq.user) {
    logContext.userId = authReq.user.id;
    logContext.userEmail = authReq.user.email;
  }

  // Attach context to request for use in other middleware/controllers
  req.logContext = logContext;
  req.startTime = startTime;

  // Log the incoming request
  const requestLog: RequestLog = {
    ...logContext,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: getRelevantHeaders(req),
  };

  logger.request(requestLog);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any, cb?: (() => void) | undefined) {
    const responseTime = Date.now() - startTime;

    // Log the response
    const responseLog: ResponseLog = {
      ...logContext,
      statusCode: res.statusCode,
      responseTime,
      contentLength: res.get("Content-Length") ? parseInt(res.get("Content-Length")!) : undefined,
    };

    // Add error info if response indicates an error
    if (res.statusCode >= 400) {
      responseLog.error = res.statusMessage || `HTTP ${res.statusCode}`;
    }

    logger.response(responseLog);

    // Call original end method and return its result
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

/**
 * Middleware to log authentication events
 */
export const authLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json;

  res.json = function (body: any) {
    const authReq = req as AuthenticatedRequest;
    const context = {
      requestId: req.logContext?.requestId,
      ip: req.logContext?.ip,
      userAgent: req.logContext?.userAgent,
      success: body?.success,
      userId: authReq.user?.id || body?.data?.user?.id,
    };

    // Log different auth events
    if (req.route?.path === "/register" || req.url.includes("/register")) {
      if (body?.success) {
        logger.auth("User registration successful", context);
      } else {
        logger.auth("User registration failed", { ...context, error: body?.message });
      }
    } else if (req.route?.path === "/login" || req.url.includes("/login")) {
      if (body?.success) {
        logger.auth("User login successful", context);
      } else {
        logger.auth("User login failed", { ...context, error: body?.message });
      }
    } else if (req.route?.path === "/logout" || req.url.includes("/logout")) {
      logger.auth("User logout", context);
    }

    return originalJson.call(this, body);
  };

  next();
};

/**
 * Middleware to log database operations
 */
export const databaseLoggingMiddleware = (operation: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const context = {
      requestId: req.logContext?.requestId,
      userId: (req as AuthenticatedRequest).user?.id,
      operation,
    };

    logger.database(`Database operation: ${operation}`, context);
    next();
  };
};

/**
 * Error logging middleware - should be placed after other middleware
 */
export const errorLoggingMiddleware = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  const context = {
    requestId: req.logContext?.requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    userId: (req as AuthenticatedRequest).user?.id,
    ip: req.logContext?.ip,
    userAgent: req.logContext?.userAgent,
    stack: error.stack,
    body: logger["sanitizeBody"] ? logger["sanitizeBody"](req.body) : req.body,
  };

  logger.error(`Unhandled error: ${error.message}`, context);
  next(error);
};

/**
 * Development logging middleware - more verbose logging for development
 */
export const developmentLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV !== "development") {
    return next();
  }

  const context = {
    requestId: req.logContext?.requestId,
    headers: req.headers,
    cookies: req.cookies,
    session: req.session,
    body: req.body,
    query: req.query,
    params: req.params,
  };

  logger.debug("Development request details", context);
  next();
};

/**
 * Performance logging middleware - logs slow requests
 */
export const performanceLoggingMiddleware = (slowThresholdMs: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any, cb?: (() => void) | undefined) {
      const responseTime = Date.now() - startTime;

      if (responseTime > slowThresholdMs) {
        const context = {
          requestId: req.logContext?.requestId,
          method: req.method,
          url: req.originalUrl || req.url,
          responseTime,
          threshold: slowThresholdMs,
          userId: (req as AuthenticatedRequest).user?.id,
        };

        logger.warn(`Slow request detected (${responseTime}ms > ${slowThresholdMs}ms)`, context);
      }

      // Return the result of the original end to match the expected type
      return originalEnd.call(this, chunk, encoding, cb);
    };

    next();
  };
};

/**
 * Helper function to get relevant headers for logging
 */
function getRelevantHeaders(req: Request): Record<string, string> {
  const relevantHeaders = ["content-type", "content-length", "authorization", "user-agent", "x-forwarded-for", "x-real-ip", "referer", "origin"];

  const headers: Record<string, string> = {};

  for (const header of relevantHeaders) {
    const value = req.get(header);
    if (value) {
      // Sanitize authorization header
      if (header === "authorization") {
        headers[header] = value.startsWith("Bearer ") ? "Bearer [REDACTED]" : "[REDACTED]";
      } else {
        headers[header] = value;
      }
    }
  }

  return headers;
}

/**
 * Skip logging for certain routes (health checks, static files, etc.)
 */
export const skipLogging = (paths: string[] = ["/health", "/favicon.ico"]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const shouldSkip = paths.some((path) => req.path.startsWith(path));

    if (shouldSkip) {
      return next();
    }

    loggingMiddleware(req, res, next);
  };
};
