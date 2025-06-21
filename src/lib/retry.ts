/**
 * Executes an operation with retry logic and exponential backoff
 * @param operation Function to execute and potentially retry
 * @param maxRetries Maximum number of retry attempts
 * @param baseDelay Base delay in milliseconds before retrying
 * @param shouldRetry Optional function to determine if a specific error should trigger a retry
 * @returns Promise resolving to the operation result
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
  shouldRetry?: (error: any) => boolean
): Promise<T> {
  // For tracking attempts
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Attempt the operation
      return await operation();
    } catch (err: any) {
      // Log the error with attempt information
      console.error(`Operation failed (attempt ${attempt + 1}/${maxRetries}):`, err);
      
      // If this was our last attempt, throw the error
      if (attempt === maxRetries - 1) {
        console.error('All retry attempts failed');
        throw err;
      }
      
      // If shouldRetry function is provided, check if we should retry for this error
      if (shouldRetry && !shouldRetry(err)) {
        throw err;
      }
      
      // Calculate wait time with exponential backoff
      const waitTime = baseDelay * Math.pow(2, attempt);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw new Error('Unexpected error in retry logic');
}

/**
 * Determines if an error is retryable based on common network/blockchain errors
 * @param error The error to check
 * @returns boolean indicating if the error should trigger a retry
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || '';
  
  // Network-related errors that are likely temporary
  const retryableErrors = [
    'network error',
    'timeout',
    'connection refused',
    'connection reset',
    'connection closed',
    'socket hang up',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'ECONNRESET',
    'ENOTFOUND',
    'too many requests',
    '429',
    '500',
    '502',
    '503',
    '504',
    'rate limit',
    'service unavailable',
    'internal server error',
    'bad gateway',
    'gateway timeout',
    'temporary failure',
    'gas price too low',
    'insufficient funds for gas',
    'transaction underpriced',
    'nonce too low',
    'replacement transaction underpriced',
  ];
  
  // Check if the error message contains any of the retryable patterns
  return retryableErrors.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}
