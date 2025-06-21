/**
 * Maps blockchain error messages to user-friendly messages
 */

// Common error patterns and their user-friendly messages
const ERROR_MAPPINGS: Record<string, string> = {
  // Registry and object errors
  'Could not find the referenced object': 'Tournament registry not found. Please create a registry first.',
  'Dependent package not found on-chain': 'Tournament package not found on this network. Please check your wallet network.',
  'Registry not found': 'Tournament registry not found. Please create a registry first.',
  'Object not found': 'The requested object was not found on the blockchain.',
  
  // Transaction errors
  'insufficient gas': 'Insufficient gas to complete transaction. Please add more SUI to your wallet.',
  'gas budget': 'Gas budget too low for this transaction. Please increase the gas budget.',
  'transaction expired': 'Transaction expired. Please try again.',
  'transaction already executed': 'This transaction was already executed.',
  
  // Wallet errors
  'wallet not connected': 'Your wallet is not connected. Please connect your wallet first.',
  'user rejected': 'Transaction was rejected by the wallet. Please approve the transaction.',
  'wallet disconnected': 'Your wallet was disconnected. Please reconnect and try again.',
  
  // Network errors
  'network error': 'Network error. Please check your internet connection and try again.',
  'timeout': 'Request timed out. The network might be congested.',
  'rate limit': 'Too many requests. Please wait a moment and try again.',
  
  // Permission errors
  'not owner': 'You do not have permission to perform this action.',
  'not authorized': 'You are not authorized to perform this action.',
  
  // Tournament-specific errors
  'tournament not found': 'Tournament not found. It may have been deleted or not exist on this network.',
  'tournament already ended': 'This tournament has already ended.',
  'tournament not active': 'This tournament is not active yet.',
  'tournament full': 'This tournament is full and not accepting more entries.',
  'already registered': 'This NFT is already registered for this tournament.',
  'already voted': 'You have already voted in this tournament.',
  
  // NFT errors
  'NFT not owned': 'You do not own this NFT.',
  'NFT not found': 'The NFT was not found.',
  'NFT not eligible': 'This NFT is not eligible for this tournament.',
};

/**
 * Maps an error message to a user-friendly message
 * @param error The error object or message
 * @returns A user-friendly error message
 */
export function mapErrorToUserMessage(error: unknown): string {
  // Default error message
  let defaultMessage = 'An error occurred. Please try again.';
  
  // Extract error message
  let errorMessage = '';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as any).message);
  } else {
    errorMessage = String(error);
  }
  
  // Check for known error patterns
  for (const [pattern, message] of Object.entries(ERROR_MAPPINGS)) {
    if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
      return message;
    }
  }
  
  // Network-specific errors
  if (errorMessage.includes('testnet')) {
    return 'This operation is only available on the Sui Testnet. Please switch your wallet to Testnet.';
  }
  if (errorMessage.includes('mainnet')) {
    return 'This operation is only available on the Sui Mainnet. Please switch your wallet to Mainnet.';
  }
  
  // If we couldn't map the error, return a default message with the original error
  return `${defaultMessage} (${errorMessage.substring(0, 100)}${errorMessage.length > 100 ? '...' : ''})`;
}

/**
 * Determines if an error is related to a missing registry
 * @param error The error object or message
 * @returns True if the error is related to a missing registry
 */
export function isRegistryError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.toLowerCase().includes('could not find the referenced object') ||
    errorMessage.toLowerCase().includes('registry not found')
  );
}

/**
 * Determines if an error is related to a network mismatch
 * @param error The error object or message
 * @returns True if the error is related to a network mismatch
 */
export function isNetworkError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.toLowerCase().includes('dependent package not found on-chain') ||
    errorMessage.toLowerCase().includes('network mismatch') ||
    errorMessage.toLowerCase().includes('wrong network')
  );
}
