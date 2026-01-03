/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by stopping requests to failing services
 * and allowing them to recover.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of failures before opening circuit
  resetTimeout?: number; // Time in ms before attempting to close circuit
  halfOpenMaxCalls?: number; // Max calls in half-open state
  successThreshold?: number; // Successes needed to close from half-open
}

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  jitter?: boolean;
  retryable?: (error: any) => boolean;
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: CircuitState = 'CLOSED';
  private halfOpenCalls = 0;
  private halfOpenSuccesses = 0;

  constructor(
    private options: CircuitBreakerOptions = {}
  ) {
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 60000, // 1 minute
      halfOpenMaxCalls: options.halfOpenMaxCalls || 3,
      successThreshold: options.successThreshold || 2,
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === 'OPEN') {
      // Check if enough time has passed to try half-open
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout!) {
        this.state = 'HALF_OPEN';
        this.halfOpenCalls = 0;
        this.halfOpenSuccesses = 0;
      } else {
        throw new CircuitBreakerError(
          'Circuit breaker is OPEN. Service is unavailable.',
          this.getState()
        );
      }
    }

    // Check half-open call limit
    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenCalls >= this.options.halfOpenMaxCalls!) {
        // Too many calls in half-open, open circuit again
        this.state = 'OPEN';
        this.lastFailureTime = Date.now();
        throw new CircuitBreakerError(
          'Circuit breaker exceeded half-open call limit',
          this.getState()
        );
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      this.halfOpenSuccesses++;
      if (
        this.halfOpenSuccesses >= this.options.successThreshold!
      ) {
        // Enough successes, close circuit
        this.state = 'CLOSED';
        this.halfOpenCalls = 0;
        this.halfOpenSuccesses = 0;
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Any failure in half-open immediately opens circuit
      this.state = 'OPEN';
      this.halfOpenCalls = 0;
      this.halfOpenSuccesses = 0;
    } else if (
      this.failures >= this.options.failureThreshold!
    ) {
      this.state = 'OPEN';
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failures;
  }

  /**
   * Reset circuit breaker (for testing or manual recovery)
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = 0;
    this.halfOpenCalls = 0;
    this.halfOpenSuccesses = 0;
  }
}

/**
 * Circuit Breaker Error
 */
export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public state: CircuitState
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * Retry Handler with Exponential Backoff and Jitter
 */
export class RetryHandler {
  /**
   * Retry a function with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      jitter = true,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (options.retryable && !options.retryable(error)) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt < maxAttempts - 1) {
          const delay = this.calculateDelay(
            attempt,
            baseDelay,
            maxDelay,
            jitter
          );
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw lastError!;
  }

  /**
   * Calculate delay with exponential backoff and optional jitter
   */
  private calculateDelay(
    attempt: number,
    base: number,
    max: number,
    jitter: boolean
  ): number {
    const exponential = Math.min(base * Math.pow(2, attempt), max);
    if (jitter) {
      // Add random jitter (±10%)
      const jitterAmount = exponential * 0.1 * (Math.random() * 2 - 1);
      return Math.max(0, exponential + jitterAmount);
    }
    return exponential;
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx errors
    if (error.status === 429 || error.status >= 500) {
      return true;
    }

    // Retry on connection errors
    if (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND'
    ) {
      return true;
    }

    // Retry on rate limit errors
    if (error.message?.includes('rate limit')) {
      return true;
    }

    return false;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Error Classifier - Classifies errors for appropriate handling
 */
export class ErrorClassifier {
  classify(error: Error | any): {
    type: string;
    recoverable: boolean;
    retryAfter?: number;
  } {
    const errorMessage = error.message || String(error);
    const errorStatus = error.status || error.statusCode;

    // Rate limit errors
    if (errorStatus === 429 || errorMessage.includes('rate limit')) {
      return {
        type: 'RATE_LIMIT',
        recoverable: true,
        retryAfter: 60, // Retry after 60 seconds
      };
    }

    // Timeout errors
    if (
      errorStatus === 408 ||
      errorMessage.includes('timeout') ||
      error.code === 'ETIMEDOUT'
    ) {
      return {
        type: 'TIMEOUT',
        recoverable: true,
        retryAfter: 5, // Retry after 5 seconds
      };
    }

    // Network errors
    if (
      error.code === 'ECONNRESET' ||
      error.code === 'ENOTFOUND' ||
      errorMessage.includes('network')
    ) {
      return {
        type: 'NETWORK',
        recoverable: true,
        retryAfter: 10, // Retry after 10 seconds
      };
    }

    // Validation errors (not retryable)
    if (
      errorStatus === 400 ||
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid')
    ) {
      return {
        type: 'VALIDATION',
        recoverable: false,
        retryAfter: 0,
      };
    }

    // Authentication errors (not retryable)
    if (errorStatus === 401 || errorStatus === 403) {
      return {
        type: 'AUTHENTICATION',
        recoverable: false,
        retryAfter: 0,
      };
    }

    // Server errors (retryable)
    if (errorStatus >= 500) {
      return {
        type: 'SERVER_ERROR',
        recoverable: true,
        retryAfter: 30, // Retry after 30 seconds
      };
    }

    // Unknown errors (assume retryable)
    return {
      type: 'UNKNOWN',
      recoverable: true,
      retryAfter: 30,
    };
  }
}

