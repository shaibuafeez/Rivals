// Environment configuration for blockchain interactions

// Package IDs - these will be updated after deployment
export const PACKAGE_IDS = {
  // Tournament contract package ID
  TOURNAMENT_PACKAGE_ID: process.env.NEXT_PUBLIC_TOURNAMENT_PACKAGE_ID || '0x0',
  
  // Simple tournament contract package ID
  SIMPLE_TOURNAMENT_PACKAGE_ID: process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID || '0xa8da138454ae256fa6b7904bad7b02d0b6c09474a022332d2d2b4c799d6573d6',
  
  // Tournament registry object ID
  TOURNAMENT_REGISTRY_ID: process.env.NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID || '0x0',
  
  // Walrus package ID
  WALRUS_PACKAGE_ID: process.env.NEXT_PUBLIC_WALRUS_PACKAGE_ID || '0x0',
};

// Network configuration
export const NETWORK = {
  // Current network (mainnet, testnet, devnet, localnet)
  CURRENT: process.env.NEXT_PUBLIC_NETWORK || 'mainnet',
};
