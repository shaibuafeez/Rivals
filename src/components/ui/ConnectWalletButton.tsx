'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';

const ConnectWalletButton = ({ className = '' }: { className?: string }) => {
  const router = useRouter();
  const account = useCurrentAccount();

  // Only redirect to tournaments page on initial connection, not on every render
  useEffect(() => {
    // Store connection state in localStorage to track initial connection
    const hasConnectedBefore = localStorage.getItem('walletConnected');
    
    if (account && !hasConnectedBefore) {
      // Set flag to prevent future redirects
      localStorage.setItem('walletConnected', 'true');
      
      // Only redirect if we're on the homepage
      if (window.location.pathname === '/') {
        router.push('/tournaments');
      }
    }
  }, [account, router]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <ConnectButton 
        style={{
          backgroundColor: 'black',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 500,
        }}
      />
    </div>
  );
};

export default ConnectWalletButton;
