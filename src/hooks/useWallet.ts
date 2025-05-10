import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useCallback, useMemo } from 'react';
import { castToSuiClient } from '@/types/sui-client';

// List of admin wallet addresses that can create tournaments
const ADMIN_ADDRESSES = [
  // Add the website owner wallet addresses here
  '0x123456789abcdef', // Example admin address - replace with real ones
  '0x987654321fedcba', // Example admin address - replace with real ones
];

export function useWallet() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const isConnected = !!account;
  const address = account?.address;

  const executeTransaction = useCallback(async (txb: TransactionBlock) => {
    if (!account) throw new Error('Wallet not connected');
    
    try {
      // Use castToSuiClient to fix type compatibility issues
      const compatibleClient = castToSuiClient(suiClient);
      const result = await compatibleClient.executeTransactionBlock({
        transactionBlock: txb,
        requestType: 'WaitForLocalExecution',
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
      
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }, [account, suiClient]);

  // Check if the current wallet is an admin wallet
  const isAdmin = useMemo(() => {
    if (!address) return false;
    return ADMIN_ADDRESSES.includes(address);
  }, [address]);

  return {
    isConnected,
    address,
    executeTransaction,
    isAdmin,
  };
}
