'use client';

import { SuiClientProvider, WalletProvider as DappKitWalletProvider, createNetworkConfig } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useMemo } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  children: ReactNode;
}

// Configure query client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      onError: (error) => {
        toast.error('Transaction failed. Please try again.');
      },
    },
  },
});

// Get network from environment or default to mainnet
const getDefaultNetwork = () => {
  const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';
  return network as 'devnet' | 'mainnet' | 'testnet';
};

// Configure networks with custom RPC if provided
const { networkConfig } = createNetworkConfig({
  devnet: { url: getFullnodeUrl('devnet') },
  mainnet: { url: process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('mainnet') },
  testnet: { url: getFullnodeUrl('testnet') },
});

export default function AppWalletProvider({ children }: Props) {
  const defaultNetwork = useMemo(() => getDefaultNetwork(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} network={defaultNetwork}>
        <DappKitWalletProvider
          autoConnect={true}
          preferredWallets={['Sui Wallet', 'Suiet', 'Ethos Wallet']}
        >
          {children}
        </DappKitWalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
