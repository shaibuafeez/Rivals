'use client';

import { ConnectButton } from '@mysten/dapp-kit';

const ConnectWalletButton = ({ className = '' }: { className?: string }) => {
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
