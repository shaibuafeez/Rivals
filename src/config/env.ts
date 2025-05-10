// Environment configuration for blockchain interactions

// Package IDs - these will be updated after deployment
export const PACKAGE_IDS = {
  // Tournament contract package ID
  TOURNAMENT_PACKAGE_ID: process.env.NEXT_PUBLIC_TOURNAMENT_PACKAGE_ID || '0x0',
  
  // Tournament registry object ID
  TOURNAMENT_REGISTRY_ID: process.env.NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID || '0x0',
  
  // Walrus package ID
  WALRUS_PACKAGE_ID: process.env.NEXT_PUBLIC_WALRUS_PACKAGE_ID || '0x0',
};

// Network configuration
export const NETWORK = {
  // Current network (mainnet, testnet, devnet, localnet)
  CURRENT: process.env.NEXT_PUBLIC_NETWORK || 'testnet',
};

// Walrus configuration
export const WALRUS_CONFIG = {
  // Walrus API endpoint
  API_ENDPOINT: process.env.NEXT_PUBLIC_WALRUS_API_ENDPOINT || 'https://api.walrus.sui.io',
  
  // Walrus API key (if needed)
  API_KEY: process.env.NEXT_PUBLIC_WALRUS_API_KEY || '',
};
