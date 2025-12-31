import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../interfaces/auth.interface.js";

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

// ANSI Color Codes
const Colors = {
  // Reset
  reset: "\x1b[0m",
  // Text styles
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  // Text colors
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  // Background colors
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
};

// HTTP Method colors
const MethodColors: Record<string, string> = {
  GET: Colors.green,
  POST: Colors.blue,
  PUT: Colors.yellow,
  PATCH: Colors.magenta,
  DELETE: Colors.red,
  OPTIONS: Colors.gray,
  HEAD: Colors.gray,
};

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private useColors: boolean;

  private constructor() {
    this.logLevel = this.getLogLevelFromEnv();
    // Disable colors if NO_COLOR env is set or not a TTY
    this.useColors = !process.env.NO_COLOR && process.stdout.isTTY !== false;
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

  private colorize(text: string, color: string): string {
    if (!this.useColors) return text;
    return `${color}${text}${Colors.reset}`;
  }

  private getLevelStyle(level: LogLevel): { color: string; icon: string; label: string } {
    switch (level) {
      case LogLevel.ERROR:
        return { color: Colors.red, icon: "✖", label: "ERROR" };
      case LogLevel.WARN:
        return { color: Colors.yellow, icon: "⚠", label: "WARN " };
      case LogLevel.INFO:
        return { color: Colors.cyan, icon: "ℹ", label: "INFO " };
      case LogLevel.DEBUG:
        return { color: Colors.gray, icon: "●", label: "DEBUG" };
    }
  }

  private formatTimestamp(): string {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour12: false });
    const ms = now.getMilliseconds().toString().padStart(3, "0");
    return `${time}.${ms}`;
  }

  private formatContext(context: any, indent: number = 2): string {
    if (!context || Object.keys(context).length === 0) return "";

    const spaces = " ".repeat(indent);
    const lines: string[] = [];

    for (const [key, value] of Object.entries(context)) {
      if (value === undefined || value === null) continue;

      const formattedKey = this.colorize(key, Colors.dim);

      if (typeof value === "object" && !Array.isArray(value)) {
        const nestedStr = JSON.stringify(value, null, 2)
          .split("\n")
          .map((line, i) => (i === 0 ? line : `${spaces}  ${line}`))
          .join("\n");
        lines.push(`${spaces}${formattedKey}: ${nestedStr}`);
      } else if (Array.isArray(value)) {
        lines.push(`${spaces}${formattedKey}: ${JSON.stringify(value)}`);
      } else {
        lines.push(`${spaces}${formattedKey}: ${value}`);
      }
    }

    return lines.length > 0 ? "\n" + lines.join("\n") : "";
  }

  private formatMessage(level: LogLevel, message: string, context?: any): string {
    const style = this.getLevelStyle(level);
    const timestamp = this.formatTimestamp();

    const timestampStr = this.colorize(`[${timestamp}]`, Colors.gray);
    const levelStr = this.colorize(`${style.icon} ${style.label}`, style.color);
    const messageStr = this.colorize(message, Colors.white);

    const contextStr = this.formatContext(context);

    return `${timestampStr} ${levelStr} ${messageStr}${contextStr}`;
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

  private getStatusCodeColor(statusCode: number): string {
    if (statusCode >= 500) return Colors.red;
    if (statusCode >= 400) return Colors.yellow;
    if (statusCode >= 300) return Colors.cyan;
    if (statusCode >= 200) return Colors.green;
    return Colors.gray;
  }

  private getResponseTimeColor(ms: number): string {
    if (ms >= 1000) return Colors.red;
    if (ms >= 500) return Colors.yellow;
    if (ms >= 100) return Colors.cyan;
    return Colors.green;
  }

  private formatMethod(method: string): string {
    const color = MethodColors[method.toUpperCase()] || Colors.white;
    return this.colorize(method.padEnd(7), color);
  }

  public request(requestLog: RequestLog): void {
    const method = this.formatMethod(requestLog.method);
    const url = this.colorize(requestLog.url, Colors.white);
    const arrow = this.colorize("→", Colors.dim);
    const message = `${method} ${arrow} ${url}`;

    const context: Record<string, any> = {};
    if (requestLog.requestId) context.requestId = requestLog.requestId;
    if (requestLog.ip) context.ip = requestLog.ip;
    if (requestLog.userId) context.userId = requestLog.userId;
    if (requestLog.userEmail) context.userEmail = requestLog.userEmail;
    if (requestLog.body && Object.keys(requestLog.body).length > 0) {
      context.body = this.sanitizeBody(requestLog.body);
    }
    if (requestLog.query && Object.keys(requestLog.query).length > 0) {
      context.query = requestLog.query;
    }
    if (requestLog.params && Object.keys(requestLog.params).length > 0) {
      context.params = requestLog.params;
    }

    this.info(message, Object.keys(context).length > 0 ? context : undefined);
  }

  public response(responseLog: ResponseLog): void {
    const method = this.formatMethod(responseLog.method);
    const url = this.colorize(responseLog.url, Colors.white);

    const statusColor = this.getStatusCodeColor(responseLog.statusCode);
    const status = this.colorize(responseLog.statusCode.toString(), statusColor + Colors.bold);

    const timeColor = this.getResponseTimeColor(responseLog.responseTime);
    const time = this.colorize(`${responseLog.responseTime}ms`, timeColor);

    const arrow = this.colorize("←", Colors.dim);
    const message = `${method} ${arrow} ${url} ${status} ${time}`;

    const context: Record<string, any> = {};
    if (responseLog.requestId) context.requestId = responseLog.requestId;
    if (responseLog.contentLength) context.contentLength = `${responseLog.contentLength} bytes`;
    if (responseLog.userId) context.userId = responseLog.userId;
    if (responseLog.error) context.error = responseLog.error;

    if (responseLog.statusCode >= 500) {
      this.error(message, Object.keys(context).length > 0 ? context : undefined);
    } else if (responseLog.statusCode >= 400) {
      this.warn(message, Object.keys(context).length > 0 ? context : undefined);
    } else {
      this.info(message, Object.keys(context).length > 0 ? context : undefined);
    }
  }

  public auth(message: string, context?: any): void {
    const prefix = this.colorize("🔐 AUTH", Colors.magenta);
    this.info(`${prefix} ${message}`, context);
  }

  public database(message: string, context?: any): void {
    const prefix = this.colorize("🗄  DB", Colors.blue);
    this.info(`${prefix} ${message}`, context);
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
