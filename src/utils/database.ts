/**
 * Database connection utilities and helper functions
 */

export interface DatabaseConnectionOptions {
  maxPoolSize?: number;
  serverSelectionTimeoutMS?: number;
  socketTimeoutMS?: number;
  bufferCommands?: boolean;
  bufferMaxEntries?: number;
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
}

export interface DatabaseStatus {
  isConnected: boolean;
  readyState: number;
  host?: string;
  name?: string;
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class ConnectionManager {
  private static connectionRetries = 0;
  private static maxRetries = 5;
  private static retryDelay = 5000;

  public static async retryConnection(connectFn: () => Promise<void>, retries: number = this.maxRetries): Promise<void> {
    try {
      await connectFn();
      this.connectionRetries = 0;
    } catch (error) {
      this.connectionRetries++;

      if (this.connectionRetries >= retries) {
        throw new DatabaseError(`Failed to connect to database after ${retries} attempts`, error as Error);
      }

      console.warn(`⚠️ Database connection attempt ${this.connectionRetries} failed. Retrying in ${this.retryDelay}ms...`);

      await this.delay(this.retryDelay);
      return this.retryConnection(connectFn, retries);
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const defaultConnectionOptions: DatabaseConnectionOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
};
