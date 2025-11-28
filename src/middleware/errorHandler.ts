import { Request, Response, NextFunction } from "express";

/**
 * Custom error class for standardized API error responses
 * Extends the native Error class with additional HTTP context
 */
export class ResponseError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: any;
  public readonly timestamp: Date;

  /**
   * Creates a new ResponseError instance
   * @param status - HTTP status code (e.g., 400, 404, 500)
   * @param message - Error message (can be string or any other type)
   * @param code - Optional error code for client-side handling (e.g., 'USER_NOT_FOUND')
   * @param details - Optional additional error details or validation errors
   */
  constructor(status: number, message: any, code?: string, details?: any) {
    super(typeof message === "string" ? message : JSON.stringify(message));

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResponseError);
    }

    this.name = "ResponseError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    // Ensure the prototype chain is properly set
    Object.setPrototypeOf(this, ResponseError.prototype);
  }

  /**
   * Converts the error to a JSON-serializable object
   */
  toJSON() {
    return {
      name: this.name,
      status: this.status,
      message: this.message,
      ...(this.code && { code: this.code }),
      ...(this.details && { details: this.details }),
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Static factory method for creating common error types
   */
  static badRequest(message: any, code?: string, details?: any): ResponseError {
    return new ResponseError(400, message, code, details);
  }

  static unauthorized(message: any = "Unauthorized", code?: string): ResponseError {
    return new ResponseError(401, message, code);
  }

  static forbidden(message: any = "Forbidden", code?: string): ResponseError {
    return new ResponseError(403, message, code);
  }

  static notFound(message: any, code?: string): ResponseError {
    return new ResponseError(404, message, code);
  }

  static conflict(message: any, code?: string, details?: any): ResponseError {
    return new ResponseError(409, message, code, details);
  }

  static internalServer(message: any = "Internal Server Error", code?: string): ResponseError {
    return new ResponseError(500, message, code);
  }

  static validationError(message: any, details?: any): ResponseError {
    return new ResponseError(400, message, "VALIDATION_ERROR", details);
  }
}

/**
 * Express error handler middleware
 * Handles all errors thrown in the application and returns standardized JSON responses
 */
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Handle ResponseError instances
  if (err instanceof ResponseError) {
    return res.status(err.status).json({
      status: "error",
      message: err.message,
      ...(err.code && { code: err.code }),
      ...(err.details && { details: err.details }),
      timestamp: err.timestamp.toISOString(),
    });
  }

  // Handle other known error types (e.g., validation errors, database errors)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation Error",
      code: "VALIDATION_ERROR",
      details: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
      code: "UNAUTHORIZED",
      timestamp: new Date().toISOString(),
    });
  }

  // Handle generic errors
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    message,
    timestamp: new Date().toISOString(),
  });
};

// Keep backward compatibility with old error class name
export const CustomErrorHandler = ResponseError;

export { errorHandler };
