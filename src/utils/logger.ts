import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "#interfaces/auth.interface.js";

export interface LogContext {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  userId?: string;
  userEmail?: string;
  timestamp: string;
}

export interface RequestLog extends LogContext {
  body?: any;
  query?: any;
  params?: any;
  headers?: Record<string, string>;
}

export interface ResponseLog extends LogContext {
  statusCode: number;
  responseTime: number;
  contentLength?: number;
  error?: string;
}

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    this.logLevel = this.getLogLevelFromEnv();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() as LogLevel;
    return Object.values(LogLevel).includes(envLevel) ? envLevel : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: any): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
    }
  }

  public error(message: string, context?: any): void {
    this.log(LogLevel.ERROR, message, context);
  }

  public warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  public info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  public debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public request(requestLog: RequestLog): void {
    const message = `${requestLog.method} ${requestLog.url}`;
    const context = {
      requestId: requestLog.requestId,
      ip: requestLog.ip,
      userAgent: requestLog.userAgent,
      userId: requestLog.userId,
      userEmail: requestLog.userEmail,
      body: this.sanitizeBody(requestLog.body),
      query: requestLog.query,
      params: requestLog.params,
    };
    this.info(message, context);
  }

  public response(responseLog: ResponseLog): void {
    const message = `${responseLog.method} ${responseLog.url} - ${responseLog.statusCode} (${responseLog.responseTime}ms)`;
    const context = {
      requestId: responseLog.requestId,
      statusCode: responseLog.statusCode,
      responseTime: responseLog.responseTime,
      contentLength: responseLog.contentLength,
      userId: responseLog.userId,
      error: responseLog.error,
    };

    if (responseLog.statusCode >= 500) {
      this.error(message, context);
    } else if (responseLog.statusCode >= 400) {
      this.warn(message, context);
    } else {
      this.info(message, context);
    }
  }

  public auth(message: string, context?: any): void {
    this.info(`AUTH: ${message}`, context);
  }

  public database(message: string, context?: any): void {
    this.info(`DB: ${message}`, context);
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== "object") return body;

    const sanitized = { ...body };
    const sensitiveFields = ["password", "token", "secret", "key", "authorization"];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    }

    return sanitized;
  }
}

export const logger = Logger.getInstance();
