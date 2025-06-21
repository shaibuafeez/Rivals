'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCheckSpecificNFT } from '@/utils/checkNFTInKiosk';
import { Loader2, CheckCircle, XCircle, Wallet } from 'lucide-react';

interface NFTOwnershipCheckerProps {
  nftId: string;
  nftType?: string;
  onOwnershipVerified?: (isOwner: boolean, isInKiosk: boolean) => void;
}

export function NFTOwnershipChecker({ 
  nftId, 
  nftType,
  onOwnershipVerified 
}: NFTOwnershipCheckerProps) {
  const account = useCurrentAccount();
  const { found, isInKiosk, kioskId, loading, error } = useCheckSpecificNFT(
    account?.address,
    nftId,
    nftType
  );

  // Call callback when ownership status changes
  useState(() => {
    if (!loading && onOwnershipVerified) {
      onOwnershipVerified(found, isInKiosk);
    }
  });

  if (!account) {
    return (
      <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please connect your wallet to check NFT ownership
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Checking NFT ownership...
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Searching wallet and kiosks
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-3">
        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        <div>
          <p className="text-sm font-medium text-red-900 dark:text-red-100">
            Error checking ownership
          </p>
          <p className="text-xs text-red-700 dark:text-red-300">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (found) {
    return (
      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            NFT ownership verified!
          </p>
        </div>
        {isInKiosk && (
          <div className="ml-8 space-y-1">
            <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
              <Wallet className="w-4 h-4" />
              <span>NFT is stored in your kiosk</span>
            </div>
            {kioskId && (
              <p className="text-xs text-green-600 dark:text-green-400 font-mono">
                Kiosk: {kioskId.substring(0, 16)}...
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 flex items-center gap-3">
      <XCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      <div>
        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
          NFT not found in wallet
        </p>
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          NFT ID: {nftId.substring(0, 16)}...
        </p>
      </div>
    </div>
  );
}

// Example usage component
export function NFTGatedContent({ requiredNftId, requiredNftType, children }: {
  requiredNftId: string;
  requiredNftType?: string;
  children: React.ReactNode;
}) {
  const account = useCurrentAccount();
  const { found, loading } = useCheckSpecificNFT(
    account?.address,
    requiredNftId,
    requiredNftType
  );

  if (!account) {
    return (
      <div className="text-center p-8">
        <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your wallet to access this content
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-8">
        <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">
          Verifying NFT ownership...
        </p>
      </div>
    );
  }

  if (!found) {
    return (
      <div className="text-center p-8">
        <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
          Access Denied
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          You need to own NFT {requiredNftId.substring(0, 16)}... to access this content
        </p>
      </div>
    );
  }

  return <>{children}</>;
}