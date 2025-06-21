import { useEffect, useState } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { useWallet } from './useWallet';
import { connectionState } from '@/lib/connectionState';

export type NetworkType = 'testnet' | 'mainnet' | 'devnet' | 'unknown';

// Define known chain IDs for Sui networks
const NETWORK_CHAIN_IDS = {
  TESTNET: '4a06526c', // Current Sui Testnet chain ID
  MAINNET: '7a7c0d24', // Mainnet chain ID
  DEVNET: '5d2bfa63', // Devnet chain ID (may change frequently)
};

export function useNetworkInfo() {
  const { isConnected } = useWallet();
  const suiClient = useSuiClient();
  const [networkName, setNetworkName] = useState<NetworkType>('unknown');
  const [chainId, setChainId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // We use the singleton connectionState manager to track network checks across all components
  // This ensures we only check the network once regardless of how many components use this hook

  useEffect(() => {
    // Only check the network if we're connected and have a client
    // AND either we haven't checked yet OR we were previously disconnected
    if (isConnected && suiClient && 
        (!connectionState.hasCheckedNetwork || networkName === 'unknown')) {
      
      // Only set loading state if we're actually going to make a network request
      if (!connectionState.hasCheckedNetwork) {
        setIsLoading(true);
        setError(null);
      }
      
      // Mark as checked to prevent duplicate checks
      connectionState.hasCheckedNetwork = true;
      
      // Use the same approach as in tournamentService for consistency
      suiClient.getLatestSuiSystemState().then(() => {
        // Check environment configuration to determine network
        const envNetwork = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';
        const network: NetworkType = envNetwork as NetworkType;
        
        // Only update state if the network has changed
        if (networkName !== network) {
          setNetworkName(network);
          setChainId(network === 'mainnet' ? NETWORK_CHAIN_IDS.MAINNET : NETWORK_CHAIN_IDS.TESTNET);
          connectionState.lastKnownNetwork = network;
        }
        
        setIsLoading(false);
        
        // Update network info logging flag
        if (!connectionState.hasLoggedNetworkInfo) {
          connectionState.hasLoggedNetworkInfo = true;
        }
      }).catch((err: Error) => {
        console.error('Error detecting wallet network:', err);
        setError('Failed to detect network');
        setIsLoading(false);
      });
    } else if (!isConnected) {
      // Only reset if we were previously connected
      if (connectionState.hasCheckedNetwork) {
        // Reset network state but keep the hasCheckedNetwork flag
        // so we don't check again immediately on reconnect
        setNetworkName('unknown');
        setChainId('');
      }
    }
  }, [isConnected, suiClient, networkName]); // connectionState is intentionally omitted as it's a singleton
  
  // Compute if we're on testnet
  const isTestnet = networkName === 'testnet';
  
  return { 
    networkName, 
    chainId, 
    isConnected, 
    isLoading, 
    error,
    isTestnet,
    isMainnet: networkName === 'mainnet',
    isDevnet: networkName === 'devnet',
    isUnknown: networkName === 'unknown'
  };
}
