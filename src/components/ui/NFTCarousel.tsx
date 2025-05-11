'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import '@/styles/components.css';
import { FC, useState, useEffect } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { useWallet } from '@/hooks/useWallet';
import { TournamentService } from '@/services/tournamentService';
import { castToSuiClient } from '@/types/sui-client';

interface NFTDisplay {
  id: string;
  imageUrl: string;
  name: string;
  owner: string;
  votes: number;
}

interface NFTCarouselProps {
  tournamentId?: string;
}

const NFTCarousel: FC<NFTCarouselProps> = ({ tournamentId }) => {
  const [nfts, setNfts] = useState<NFTDisplay[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  
  const dragThreshold = 50;
  
  const suiClient = useSuiClient();
  const { isConnected, executeTransaction } = useWallet();
  const tournamentService = new TournamentService(castToSuiClient(suiClient));
  
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch NFTs from the tournament
        // For now, we'll use mock data
        
        const mockNFTs: NFTDisplay[] = [
          {
            id: '0xnft1',
            imageUrl: '/images/nft-skull.png',
            name: 'Doonies #337',
            owner: '@van.sui',
            votes: 25,
          },
          {
            id: '0xnft2',
            imageUrl: '/images/nft-skull.png',
            name: 'Doonies #142',
            owner: '@crypto.sui',
            votes: 18,
          },
          {
            id: '0xnft3',
            imageUrl: '/images/nft-skull.png',
            name: 'Doonies #789',
            owner: '@nft.collector',
            votes: 12,
          },
        ];
        
        setNfts(mockNFTs);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [tournamentId]);

  const handleNext = async () => {
    if (voting || nfts.length === 0) return;
    
    if (tournamentId && isConnected) {
      try {
        setVoting(true);
        
        // Vote for the current NFT
        const txb = tournamentService.voteForNFTTransaction(
          tournamentId,
          nfts[currentIndex].id
        );
        
        await executeTransaction(txb);
        
        // Update local state to reflect the vote
        const updatedNfts = [...nfts];
        updatedNfts[currentIndex].votes += 1;
        setNfts(updatedNfts);
      } catch (error) {
        console.error('Error voting for NFT:', error);
      } finally {
        setVoting(false);
      }
    }
    
    setCurrentIndex((prev) => (prev + 1) % nfts.length);
  };

  const handlePrev = () => {
    if (voting || nfts.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + nfts.length) % nfts.length);
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (voting) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (voting) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const delta = dragStart - clientX;

    if (Math.abs(delta) > dragThreshold) {
      if (delta > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const getDisplayImages = () => {
    if (nfts.length === 0) {
      return {
        leftImages: [],
        centerImage: null,
        rightImages: []
      };
    }
    
    const centerIndex = currentIndex;
    const leftImages = [
      nfts[(centerIndex - 2 + nfts.length) % nfts.length],
      nfts[(centerIndex - 1 + nfts.length) % nfts.length]
    ];
    const rightImages = [
      nfts[(centerIndex + 1) % nfts.length],
      nfts[(centerIndex + 2) % nfts.length]
    ];

    return {
      leftImages,
      centerImage: nfts[centerIndex],
      rightImages
    };
  };

  if (loading) {
    return <div className="text-center py-10">Loading NFTs...</div>;
  }

  if (nfts.length === 0) {
    return <div className="text-center py-10">No NFTs found in this tournament.</div>;
  }

  const { leftImages, centerImage, rightImages } = getDisplayImages();

  return (
    <div className="relative w-full overflow-hidden">
      <div 
        className="flex justify-center items-center min-h-[340px] cursor-pointer"
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
          {tournamentId && !isConnected && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-40 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-medium">
            Connect wallet to vote
          </div>
        )}

        {/* Side Cards - Left */}
        {leftImages.map((nft, index) => (
          <motion.div
            key={`left-${nft.id}`}
            initial={{ opacity: 0, x: -100 * (index + 1), rotate: -5 * (index + 1) }}
            animate={{ 
              opacity: 0.2,
              x: -140 * (index + 1),
              y: 0
            }}
            className="absolute"
          >
            <div className="w-[240px] bg-white rounded-lg p-3 shadow-md transform -rotate-6">
              <div className="w-full aspect-square bg-black">
                <Image
                  src={nft.imageUrl}
                  alt={nft.name}
                  width={240}
                  height={240}
                  className="object-cover w-full h-full grayscale"
                />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Center NFT Card */}
        {centerImage && (
          <motion.div
            key={centerImage.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-30"
          >
            <div className="w-[260px] bg-white rounded-lg p-3 shadow-xl">
              <div className="relative aspect-square bg-black">
                <Image
                  src={centerImage.imageUrl}
                  alt={centerImage.name}
                  width={260}
                  height={260}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{centerImage.owner}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{centerImage.votes}</span>
                    <span className="text-xs text-gray-500">{centerImage.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Side Cards - Right */}
        {rightImages.map((nft, index) => (
          <motion.div
            key={`right-${nft.id}`}
            initial={{ opacity: 0, x: 100 * (index + 1), rotate: 5 * (index + 1) }}
            animate={{ 
              opacity: 0.2,
              x: 140 * (index + 1),
              y: 0
            }}
            className="absolute"
          >
            <div className="w-[240px] bg-white rounded-lg p-3 shadow-md transform rotate-6">
              <div className="w-full aspect-square bg-black">
                <Image
                  src={nft.imageUrl}
                  alt={nft.name}
                  width={240}
                  height={240}
                  className="object-cover w-full h-full grayscale"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {tournamentId && (
        <div className="text-center mt-4 text-sm text-gray-500">
          Swipe left or right to vote for your favorite NFT
        </div>
      )}
    </div>
  );
};

export default NFTCarousel;