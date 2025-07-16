'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { AzurGuardianNFT, azurGuardianService } from '@/services/azurGuardianService';
import Image from 'next/image';

interface AzurGuardianSelectorProps {
  onSelect: (nft: AzurGuardianNFT) => void;
  selectedNftId?: string;
}

export default function AzurGuardianSelector({ onSelect, selectedNftId }: AzurGuardianSelectorProps) {
  const [nfts, setNfts] = useState<AzurGuardianNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const account = useCurrentAccount();
  
  useEffect(() => {
    async function fetchNFTs() {
      if (!account?.address) {
        setError('Please connect your wallet to view your Azur Guardian NFTs');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const azurNFTs = await azurGuardianService.getWalletAzurGuardianNFTs(account.address);
        
        if (azurNFTs.length === 0) {
          setError('No Azur Guardian NFTs found in your wallet. You need at least one to enter the tournament.');
        } else {
          setNfts(azurNFTs);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching Azur Guardian NFTs:', err);
        setError('Failed to load your Azur Guardian NFTs. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchNFTs();
  }, [account?.address]);
  
  if (loading) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your Azur Guardian NFTs...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">No NFTs Found</h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          {error.includes('No Azur Guardian NFTs found') && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Azur Guardian NFTs are required to enter this exclusive tournament.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href={`https://www.tradeport.xyz/sui/collection/${process.env.NEXT_PUBLIC_AZUR_GUARDIAN_NFT_TYPE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  🛡️ Buy on Tradeport
                </a>
                <a 
                  href="https://app.clutchy.io/collection/mainnet/0xfc9d0c6972cae3f303030b993485af37e2d86ebf3b409d1e6a40cde955a43a77"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  🎮 Buy on Clutchy
                </a>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                Note: You currently have AZUR tokens but no Azur Guardian NFTs. The NFTs and tokens are different assets.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Select an Azur Guardian NFT</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {nfts.map((nft) => (
          <div
            key={nft.id}
            className={`
              border rounded-lg p-3 cursor-pointer transition-all
              ${selectedNftId === nft.id 
                ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}
            `}
            onClick={() => onSelect(nft)}
          >
            <div className="aspect-square relative overflow-hidden rounded-md mb-2">
              {nft.imageUrl ? (
                <Image
                  src={nft.imageUrl}
                  alt={nft.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  onError={(e) => {
                    // Fallback for broken images
                    (e.target as HTMLImageElement).src = '/images/nft-placeholder.png';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>
            
            <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">{nft.name}</h4>
            
            {nft.rarity && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                {nft.rarity}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {nfts.length > 0 && !selectedNftId && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Click on an NFT to select it for the tournament
        </p>
      )}
    </div>
  );
}
