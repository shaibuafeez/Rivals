'use client';

import { useEffect, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { hasAnyAzurGuardianNFT, useCheckAzurGuardianNFT, AZUR_GUARDIAN_NFT_TYPE } from '@/utils/azurGuardianChecker';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AzurGuardianGateProps {
  children: React.ReactNode;
  requiredNftId?: string; // Specific NFT ID if needed
  fallback?: React.ReactNode; // Custom fallback content
  onAccessGranted?: () => void;
  onAccessDenied?: () => void;
}

/**
 * Component that gates content for Azur Guardian NFT holders
 */
export function AzurGuardianGate({ 
  children, 
  requiredNftId,
  fallback,
  onAccessGranted,
  onAccessDenied 
}: AzurGuardianGateProps) {
  const account = useCurrentAccount();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Use hook if specific NFT is required
  const specificNftCheck = useCheckAzurGuardianNFT(
    requiredNftId ? account?.address : undefined,
    requiredNftId
  );

  useEffect(() => {
    const checkAccess = async () => {
      if (!account?.address) {
        setHasAccess(false);
        setIsChecking(false);
        onAccessDenied?.();
        return;
      }

      if (requiredNftId) {
        // Already checked by hook
        return;
      }

      // Check if user has any Azur Guardian NFT
      setIsChecking(true);
      try {
        const hasNFT = await hasAnyAzurGuardianNFT(account.address);
        setHasAccess(hasNFT);
        if (hasNFT) {
          onAccessGranted?.();
        } else {
          onAccessDenied?.();
        }
      } catch (error) {
        console.error('Error checking Azur Guardian NFTs:', error);
        setHasAccess(false);
        onAccessDenied?.();
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [account?.address, requiredNftId, onAccessGranted, onAccessDenied]);

  // Update access based on specific NFT check
  useEffect(() => {
    if (requiredNftId && !specificNftCheck.loading) {
      const hasSpecificAccess = specificNftCheck.found;
      setHasAccess(hasSpecificAccess);
      setIsChecking(false);
      
      if (hasSpecificAccess) {
        onAccessGranted?.();
      } else {
        onAccessDenied?.();
      }
    }
  }, [specificNftCheck, requiredNftId, onAccessGranted, onAccessDenied]);

  if (!account) {
    return fallback || <AzurGuardianAccessDenied reason="wallet" />;
  }

  if (isChecking || (requiredNftId && specificNftCheck.loading)) {
    return <AzurGuardianCheckingAccess />;
  }

  if (!hasAccess) {
    return fallback || <AzurGuardianAccessDenied reason="nft" />;
  }

  return <>{children}</>;
}

/**
 * Loading state component
 */
function AzurGuardianCheckingAccess() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Verifying Azur Guardian NFT ownership...</p>
    </div>
  );
}

/**
 * Access denied component
 */
function AzurGuardianAccessDenied({ reason }: { reason: 'wallet' | 'nft' }) {
  return (
    <div className="max-w-md mx-auto py-12">
      <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
        <Lock className="h-5 w-5 text-yellow-600" />
        <AlertDescription className="mt-2">
          <h3 className="font-semibold text-lg mb-2">Azur Guardian NFT Required</h3>
          {reason === 'wallet' ? (
            <p>Please connect your wallet to access this content.</p>
          ) : (
            <>
              <p className="mb-3">
                This content is exclusive to Azur Guardian NFT holders.
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                <p>NFT Type:</p>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded block mt-1 break-all">
                  {AZUR_GUARDIAN_NFT_TYPE}
                </code>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://tradeport.xyz/sui/collection/azur-guardians', '_blank')}
              >
                Get an Azur Guardian NFT
              </Button>
            </>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Badge component to show Azur Guardian NFT ownership
 */
export function AzurGuardianBadge({ walletAddress }: { walletAddress?: string }) {
  const [hasNFT, setHasNFT] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setChecking(false);
      return;
    }

    hasAnyAzurGuardianNFT(walletAddress)
      .then(setHasNFT)
      .finally(() => setChecking(false));
  }, [walletAddress]);

  if (!walletAddress || checking) return null;
  if (!hasNFT) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-500 to-ink-500 text-white text-xs font-medium rounded-full">
      <CheckCircle className="w-3.5 h-3.5" />
      <span>Azur Guardian</span>
    </div>
  );
}