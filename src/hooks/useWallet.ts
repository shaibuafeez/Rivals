import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SuiTransactionBlockResponse } from '@mysten/sui/client';
import type { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { mapErrorToUserMessage, isRegistryError, isNetworkError } from '@/lib/errorMapping';

// List of admin wallet addresses that can create tournaments
const ADMIN_ADDRESSES = [
  // Add the website owner wallet addresses here
  '0x123456789abcdef', // Example admin address - replace with real ones
  '0x987654321fedcba', // Example admin address - replace with real ones
];

// Import the singleton connection state manager
import { connectionState } from '@/lib/connectionState';

export function useWallet() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  
  const isConnected = !!account;
  const address = account?.address;
  
  // Create a stable object reference for the wallet state to avoid re-renders
  const walletState = useMemo(() => ({
    isConnected,
    address
  }), [isConnected, address]);
  
  useEffect(() => {
    // Only log once per session, not per component mount
    if (walletState.isConnected && !connectionState.hasLoggedWalletConnection) {
      connectionState.hasLoggedWalletConnection = true;
      
      // Only check network once
      if (!connectionState.hasCheckedWalletNetwork) {
        connectionState.hasCheckedWalletNetwork = true;
        
        // Check which network the wallet is connected to using a more compatible approach
        // This matches the approach used in tournamentService.ts
        suiClient.getLatestSuiSystemState().then(() => {
          // Check environment configuration to determine network
          const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';
          
        }).catch(err => {
          console.error('Error detecting wallet network:', err);
        });
      }
    } else if (!walletState.isConnected) {
      // Only reset the flags if we were previously connected and are now disconnected
      if (connectionState.hasLoggedWalletConnection) {
        // Use the reset method from our singleton
        connectionState.resetConnectionState();
      }
    }
  }, [walletState, suiClient]); // connectionState is intentionally omitted as it's a singleton
  
  // Use the dapp-kit hook for signing and executing transactions
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  // Track the last transaction ID for status display
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  /**
   * Execute a transaction block with the connected wallet
   */
  const executeTransaction = useCallback(async (txb: Transaction): Promise<SuiTransactionBlockResponse | null> => {
    if (!account || !signAndExecute || !isConnected) {
      const error = new Error('Wallet not connected');
      setTxStatus('error');
      throw error;
    }
    
    
    // Reset transaction status
    setTxStatus('loading');
    setLastTxId(null);
    
    try {
      
      // Add the sender to the transaction
      txb.setSender(account.address);
      
      
      // Serialize the transaction for execution
      const serialized = txb.serialize();
      
      // Sign and execute the transaction
      
      // Use a Promise to handle the transaction response
      const walletResult = await new Promise<SuiSignAndExecuteTransactionOutput>((resolve, reject) => {
        signAndExecute(
          {
            transaction: serialized
          },
          {
            onSuccess: (data) => {
              setLastTxId(data.digest);
              setTxStatus('success');
              toast.success('Transaction completed successfully!');
              resolve(data);
            },
            onError: (error) => {
              console.error('Transaction execution failed:', error);
              setTxStatus('error');
              
              // Map the error to a user-friendly message
              const userMessage = mapErrorToUserMessage(error);
              
              // Show different toasts based on error type
              if (isRegistryError(error)) {
                toast.error(`Registry error: ${userMessage}`, { duration: 6000 });
              } else if (isNetworkError(error)) {
                toast.error(`Network error: ${userMessage}`, { duration: 6000 });
              } else {
                toast.error(userMessage);
              }
              
              reject(error);
            }
          }
        );
      });
      
      // Fetch the full transaction details using the digest
      const result = await suiClient.waitForTransaction({
        digest: walletResult.digest,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        }
      });
      
      // Now we can safely access the result properties
      if (result) {
        
        if (result.effects?.status?.status === 'success') {
        } else {
          setTxStatus('error');
        }
      }
      
      return result as SuiTransactionBlockResponse;
    } catch (error) {
      console.error('Transaction failed with error:', error);
      setTxStatus('error');
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error object:', error);
      } else {
        console.error('Non-Error object:', error);
      }
      
      // Map the error to a user-friendly message
      const userMessage = mapErrorToUserMessage(error);
      
      // Show different toasts based on error type
      if (isRegistryError(error)) {
        toast.error(`Registry error: ${userMessage}`, { duration: 6000 });
      } else if (isNetworkError(error)) {
        toast.error(`Network error: ${userMessage}`, { duration: 6000 });
      } else {
        toast.error(userMessage);
      }
      
      throw error;
    }
  }, [account, signAndExecute, isConnected, suiClient]);

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
    lastTxId,
    txStatus,
    // Helper functions for transaction status
    isTransactionIdle: txStatus === 'idle',
    isTransactionLoading: txStatus === 'loading',
    isTransactionSuccess: txStatus === 'success',
    isTransactionError: txStatus === 'error',
  };
}
