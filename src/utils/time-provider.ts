/**
 * TimeProvider interface for deterministic time handling in tests.
 * CRITICAL: All auction logic must receive time from this interface.
 * Never use Date.now() or new Date() directly in domain logic.
 */
export interface TimeProvider {
  now(): Date;
}

/**
 * Real time provider for production use.
 * Uses actual system time.
 */
export class RealTimeProvider implements TimeProvider {
  now(): Date {
    return new Date();
  }
}

/**
 * Mock time provider for testing.
 * Allows setting specific times for deterministic tests.
 */
export class MockTimeProvider implements TimeProvider {
  private currentTime: Date;

  constructor(initialTime: Date = new Date()) {
    this.currentTime = new Date(initialTime);
  }

  now(): Date {
    return new Date(this.currentTime);
  }

  /**
   * Set the current mock time
   */
  setTime(time: Date): void {
    this.currentTime = new Date(time);
  }

  /**
   * Advance time by specified milliseconds
   */
  advanceTime(ms: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + ms);
  }

  /**
   * Advance time by specified minutes
   */
  advanceMinutes(minutes: number): void {
    this.advanceTime(minutes * 60 * 1000);
  }

  /**
   * Advance time by specified seconds
   */
  advanceSeconds(seconds: number): void {
    this.advanceTime(seconds * 1000);
  }
}

/**
 * Default time provider instance (uses real time)
 */
export const defaultTimeProvider: TimeProvider = new RealTimeProvider();
