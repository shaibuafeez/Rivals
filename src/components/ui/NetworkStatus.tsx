'use client';

import React, { useState } from 'react';
import { useNetworkInfo } from '@/hooks/useNetworkInfo';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface NetworkStatusProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export function NetworkStatus({ className, showLabel = true, compact = false }: NetworkStatusProps) {
  const { networkName, isConnected, isLoading, error } = useNetworkInfo();
  const account = useCurrentAccount();
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Define network-specific styles and labels
  const networkConfig = {
    testnet: { 
      color: 'bg-yellow-500', 
      label: 'Testnet',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    mainnet: { 
      color: 'bg-green-500', 
      label: 'Mainnet',
      textColor: 'text-green-600 dark:text-green-400'
    },
    devnet: { 
      color: 'bg-ink-600', 
      label: 'Devnet',
      textColor: 'text-ink-700 dark:text-ink-400'
    },
    unknown: { 
      color: 'bg-gray-500', 
      label: 'Unknown',
      textColor: 'text-gray-600 dark:text-gray-400'
    },
  };

  const currentNetwork = networkConfig[networkName] || networkConfig.unknown;
  const expectedNetwork = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';
  const isCorrectNetwork = networkName === expectedNetwork;
  
  if (!account) {
    return null; // Don't show network status if wallet not connected
  }
  
  if (isLoading) {
    return (
      <div className={cn("relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800", className)}>
        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
        {!compact && showLabel && <span className="text-xs text-gray-500">Detecting...</span>}
      </div>
    );
  }
  
  if (error || !isConnected) {
    return (
      <div 
        className={cn("relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800", className)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <WifiOff className="w-4 h-4 text-red-500" />
        {!compact && showLabel && <span className="text-xs text-red-600 dark:text-red-400">Disconnected</span>}
        
        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 text-xs whitespace-nowrap z-50">
            {error || 'Network connection lost'}
          </div>
        )}
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div 
        className={cn("relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800", className)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <AlertCircle className="w-4 h-4 text-orange-500" />
        {!compact && showLabel && (
          <span className="text-xs text-orange-600 dark:text-orange-400">
            Wrong Network
          </span>
        )}
        
        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 text-xs whitespace-nowrap z-50">
            <p className="font-medium mb-1">Network Mismatch</p>
            <p className="text-gray-600 dark:text-gray-400">
              Connected to: <span className="font-medium">{currentNetwork.label}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Expected: <span className="font-medium capitalize">{expectedNetwork}</span>
            </p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div 
      className={cn("relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800", className)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        <Wifi className={cn("w-4 h-4", currentNetwork.textColor)} />
        <span className={cn("absolute -bottom-0.5 -right-0.5 inline-block w-2 h-2 rounded-full", currentNetwork.color)}></span>
      </div>
      {!compact && showLabel && (
        <span className={cn("text-xs font-medium", currentNetwork.textColor)}>
          {currentNetwork.label}
        </span>
      )}
      
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 text-xs whitespace-nowrap z-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>Connected to {currentNetwork.label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
