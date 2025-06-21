import React from 'react';
import { useNetworkInfo } from '@/hooks/useNetworkInfo';
import { NetworkStatus } from './NetworkStatus';

interface TransactionStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  txId?: string;
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * Component to display transaction status information
 */
export function TransactionStatus({ 
  status, 
  message, 
  txId, 
  error, 
  onRetry 
}: TransactionStatusProps) {
  const { networkName, chainId } = useNetworkInfo();
  
  // Generate explorer URL if txId is provided
  const explorerUrl = txId ? getExplorerUrl(txId, networkName) : '';
  
  return (
    <div className={`
      p-4 rounded-lg border 
      ${status === 'loading' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
      ${status === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
      ${status === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
      ${status === 'idle' ? 'bg-gray-50 border-gray-200 text-gray-800' : ''}
    `}>
      <div className="flex items-center mb-2">
        {status === 'loading' && (
          <div className="animate-spin mr-2 h-5 w-5 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {status === 'success' && (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2 text-green-600" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
        
        {status === 'error' && (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2 text-red-600" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
        
        <h3 className="font-medium">
          {status === 'loading' && 'Processing Transaction'}
          {status === 'success' && 'Transaction Successful'}
          {status === 'error' && 'Transaction Failed'}
          {status === 'idle' && 'Ready for Transaction'}
        </h3>
      </div>
      
      {message && <p className="mb-2">{message}</p>}
      
      {/* Network information */}
      <div className="flex items-center mt-2 mb-2 text-sm">
        <span className="mr-2">Network:</span>
        <NetworkStatus />
      </div>
      
      {/* Transaction explorer link */}
      {txId && explorerUrl && (
        <div className="mt-2">
          <a 
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              text-sm underline
              ${status === 'loading' ? 'text-blue-600' : ''}
              ${status === 'success' ? 'text-green-600' : ''}
              ${status === 'error' ? 'text-red-600' : ''}
            `}
          >
            View transaction on explorer
          </a>
        </div>
      )}
      
      {/* Error details */}
      {status === 'error' && error && (
        <div className="mt-3 text-sm text-red-700">
          <details>
            <summary className="cursor-pointer">Error details</summary>
            <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto text-xs">
              {error.message}
            </pre>
          </details>
        </div>
      )}
      
      {/* Retry button */}
      {status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
        >
          Retry Transaction
        </button>
      )}
    </div>
  );
}

/**
 * Get the explorer URL for a transaction
 * @param txId Transaction ID
 * @param network Network name
 * @returns Explorer URL
 */
function getExplorerUrl(txId: string, network: string): string {
  // Base explorer URLs for different networks
  const explorers = {
    mainnet: 'https://explorer.sui.io/txblock',
    testnet: 'https://explorer.testnet.sui.io/txblock',
    devnet: 'https://explorer.devnet.sui.io/txblock',
    localnet: 'http://localhost:8080/txblock',
    unknown: 'https://explorer.sui.io/txblock',
  };
  
  // Get the base URL based on network
  const baseUrl = explorers[network as keyof typeof explorers] || explorers.unknown;
  
  // Return the full URL
  return `${baseUrl}/${txId}`;
}
