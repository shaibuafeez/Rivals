'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import GlobalNFTModalListener to avoid SSR issues
const GlobalNFTModalListener = dynamic(
  () => import('@/components/ui/GlobalNFTModalListener'),
  { ssr: false }
);

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      {children}
      <GlobalNFTModalListener />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--toast-background)',
            color: 'var(--toast-text)',
            border: '1px solid var(--toast-border)'
          },
        }}
      />
    </>
  );
}
