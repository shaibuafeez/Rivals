'use client';

import { useState, useEffect } from 'react';
import { ConnectButton, useCurrentAccount, useDisconnectWallet, useSuiClient } from '@mysten/dapp-kit';
import { formatAddress } from '@mysten/sui/utils';
import { ChevronDown, Wallet, LogOut, Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ConnectWalletButton = ({ className = '' }: { className?: string }) => {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const client = useSuiClient();
  const [showDropdown, setShowDropdown] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [copied, setCopied] = useState(false);

  // Fetch balance when account changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (account?.address) {
        try {
          const balance = await client.getBalance({
            owner: account.address,
            coinType: '0x2::sui::SUI',
          });
          const formatted = (Number(balance.totalBalance) / 1_000_000_000).toFixed(4);
          setBalance(formatted);
        } catch (error) {
          // Silently fail - balance will show as 0
        }
      }
    };

    fetchBalance();
  }, [account, client]);

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
    toast.success('Wallet disconnected');
  };

  if (!account) {
    return (
      <div className={`relative ${className}`}>
        <ConnectButton 
          className="!bg-black !text-white !px-3 sm:!px-6 !py-2 sm:!py-3 !rounded-lg !text-sm !font-medium hover:!bg-gray-900 !transition-all !duration-200 !border !border-gray-800 hover:!border-gray-600 !shadow-md hover:!shadow-lg !flex !items-center !gap-1 sm:!gap-2"
        >
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
        </ConnectButton>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-black text-white px-2 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-all duration-200 flex items-center gap-1 sm:gap-2 border border-gray-800 hover:border-gray-600"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="hidden sm:inline">{formatAddress(account.address)}</span>
        <span className="sm:hidden">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-black rounded-lg shadow-xl border border-gray-800 overflow-hidden z-50">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Balance</span>
                <span className="text-sm font-medium text-white">
                  {balance} SUI
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Address</span>
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
                >
                  {formatAddress(account.address)}
                  {copied ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ConnectWalletButton;
