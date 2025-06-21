'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import Image from 'next/image';
import { NFTService, NFTMetadata } from '@/services/nftService';

interface GeneralNFTSelectorProps {
  onSelect: (nft: NFTMetadata) => void;
  selectedNftId?: string;
}

export default function GeneralNFTSelector({ onSelect, selectedNftId }: GeneralNFTSelectorProps) {
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  
  useEffect(() => {
    async function fetchNFTs() {
      if (!account?.address) {
        setError('Please connect your wallet to view your NFTs');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const nftService = new NFTService(suiClient);
        // Fetch all NFTs including those in kiosks
        const userNFTs = await nftService.getUserNFTs(account.address, true);
        
        if (userNFTs.length === 0) {
          setError('No NFTs found in your wallet or kiosks. You need at least one NFT to enter the tournament.');
        } else {
          setNfts(userNFTs);
          setError(null);
          console.log(`Found ${userNFTs.length} NFTs (${userNFTs.filter(n => n.location === 'wallet').length} in wallet, ${userNFTs.filter(n => n.location === 'kiosk').length} in kiosks)`);
        }
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('Failed to load your NFTs. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchNFTs();
  }, [account?.address, suiClient]);
  
  if (loading) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your NFTs...</p>
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
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Select an NFT</h3>
      
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
              
              {/* Location Badge */}
              {nft.location === 'kiosk' && (
                <div className="absolute top-1 right-1 px-2 py-1 bg-purple-500 text-white text-xs rounded-md font-medium">
                  Kiosk
                </div>
              )}
              
              {/* Listed Badge */}
              {nft.isListed && (
                <div className="absolute top-1 left-1 px-2 py-1 bg-orange-500 text-white text-xs rounded-md font-medium">
                  Listed
                </div>
              )}
            </div>
            
            <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">{nft.name}</h4>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
              {nft.collection}
            </p>
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