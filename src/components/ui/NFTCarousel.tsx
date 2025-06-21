'use client';

import { motion, MotionConfig } from 'framer-motion';
import Image from 'next/image';
import '@/styles/components.css';
import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
// import { useTournaments } from '@/hooks/useTournaments'; // Disabled - using simple tournaments
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const ParticleEffect = dynamic(() => import('./ParticleEffect'), {
  ssr: false
});

interface NFTDisplay {
  id: string;
  imageUrl: string;
  name: string;
  owner: string;
  votes: number;
}

interface CardPosition {
  x: number;
  scale: number;
  zIndex: number;
  opacity: number;
  rotate: number;
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
  const [isPaused, setIsPaused] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [lastDragTime, setLastDragTime] = useState(0);
  const [lastDragX, setLastDragX] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const velocityRef = useRef<NodeJS.Timeout | null>(null);
  
  const dragThreshold = 30;
  const momentumMultiplier = 0.05;
  
  const { isConnected } = useWallet();
  // const { isNetworkVerified, voteForNFT } = useTournaments(); // Disabled - using simple tournaments
  const isNetworkVerified = true; // Simplified for demo
  
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        // For landing page, we'll show featured collections
        // In tournament pages, this would fetch actual entries
        
        if (!tournamentId) {
          // Landing page: Show featured NFT collections
          const featuredNFTs: NFTDisplay[] = [
            {
              id: '0xazur1',
              imageUrl: '/images/1.png',
              name: 'Azur Guardian',
              owner: 'Featured Collection',
              votes: 0,
            },
            {
              id: '0xmachines1',
              imageUrl: '/images/2.png',
              name: 'Machines',
              owner: 'Featured Collection',
              votes: 0,
            },
            {
              id: '0xfuddies1',
              imageUrl: '/images/3.png',
              name: 'Fuddies',
              owner: 'Featured Collection',
              votes: 0,
            },
            {
              id: '0xpuggies1',
              imageUrl: '/images/4.png',
              name: 'Puggies',
              owner: 'Featured Collection',
              votes: 0,
            },
            {
              id: '0xenforcers1',
              imageUrl: '/images/5.png',
              name: 'Enforcers',
              owner: 'Featured Collection',
              votes: 0,
            },
          ];
          
          setNfts(featuredNFTs);
        } else {
          // Tournament page: Would fetch real entries
          setNfts([]);
        }
        
        setCurrentIndex(0);
      } catch (error) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [tournamentId]);

  // Auto-rotation with shuffle effect
  useEffect(() => {
    if (!tournamentId && nfts.length > 0 && !isPaused && !isShuffling) {
      intervalRef.current = setInterval(() => {
        setIsShuffling(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % nfts.length);
          setIsShuffling(false);
        }, 1000);
      }, 7000); // Rotate every 7 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [nfts.length, isPaused, tournamentId, isShuffling]);

  const handleNext = useCallback(async () => {
    if (voting || nfts.length === 0 || isShuffling) return;
    
    setIsShuffling(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % nfts.length);
      setIsShuffling(false);
    }, 1000);
  }, [voting, nfts.length, isShuffling]);

  const handlePrev = useCallback(() => {
    if (voting || nfts.length === 0 || isShuffling) return;
    
    setIsShuffling(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + nfts.length) % nfts.length);
      setIsShuffling(false);
    }, 1000);
  }, [voting, nfts.length, isShuffling]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (voting || isShuffling) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
    setLastDragX(clientX);
    setLastDragTime(Date.now());
    setVelocity(0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (voting || isShuffling || dragStart === 0) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastDragTime;
    
    if (timeDiff > 0) {
      const distance = clientX - lastDragX;
      const newVelocity = distance / timeDiff;
      setVelocity(newVelocity);
      setLastDragX(clientX);
      setLastDragTime(currentTime);
    }
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (voting || isShuffling) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const delta = dragStart - clientX;

    // Apply momentum
    const finalDelta = delta - (velocity * momentumMultiplier * 100);

    if (Math.abs(finalDelta) > dragThreshold) {
      if (finalDelta > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    
    setDragStart(0);
    setVelocity(0);
  };

  const getCardPosition = (index: number): CardPosition => {
    const totalCards = nfts.length;
    const relativeIndex = (index - currentIndex + totalCards) % totalCards;
    
    // Define positions for 5 visible cards
    const positions: CardPosition[] = [
      { x: 0, scale: 1, zIndex: 30, opacity: 1, rotate: 0 }, // Center
      { x: 220, scale: 0.9, zIndex: 20, opacity: 0.95, rotate: 3 }, // Right 1
      { x: -220, scale: 0.9, zIndex: 20, opacity: 0.95, rotate: -3 }, // Left 1
      { x: 400, scale: 0.8, zIndex: 10, opacity: 0.85, rotate: 6 }, // Right 2
      { x: -400, scale: 0.8, zIndex: 10, opacity: 0.85, rotate: -6 }, // Left 2
    ];
    
    // Map relative index to position for 5 cards
    if (relativeIndex === 0) return positions[0];
    if (relativeIndex === 1 || relativeIndex === totalCards - 1) {
      return relativeIndex === 1 ? positions[1] : positions[2];
    }
    if (relativeIndex === 2 || relativeIndex === totalCards - 2) {
      return relativeIndex === 2 ? positions[3] : positions[4];
    }
    
    // Cards further away are hidden
    return { x: 0, scale: 0, zIndex: 0, opacity: 0, rotate: 0 };
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isShuffling || nfts.length === 0) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShuffling, nfts.length, handleNext, handlePrev]);

  if (loading) {
    return <div className="text-center py-10">Loading NFTs...</div>;
  }

  if (nfts.length === 0) {
    return <div className="text-center py-10">No NFTs found in this tournament.</div>;
  }

  return (
    <MotionConfig transition={{ duration: 1.8, ease: [0.32, 0.72, 0, 1] }}>
      <div className="relative w-full overflow-hidden" style={{ perspective: '1000px' }}>
        <div 
        className="flex justify-center items-center min-h-[450px] cursor-pointer relative"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={(e) => {
          handleDragEnd(e);
          setIsPaused(false);
        }}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseEnter={() => setIsPaused(true)}
      >
        {tournamentId && !isConnected && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-40 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-medium">
            Connect wallet to vote
          </div>
        )}

        {/* Deck of cards with shuffle animation */}
        {nfts.map((nft, index) => {
          const position = getCardPosition(index);
          const isCenterCard = position.zIndex === 30;
          
          return (
            <motion.div
              key={nft.id}
              initial={{ 
                x: index % 2 === 0 ? -600 : 600, 
                opacity: 0,
                scale: 0.5,
                rotate: index % 2 === 0 ? -45 : 45
              }}
              animate={{ 
                x: position.x,
                scale: position.scale,
                opacity: position.opacity,
                rotate: position.rotate,
                y: isCenterCard ? [0, -8, 0] : 0
              }}
              transition={{
                x: { type: "spring", stiffness: 100, damping: 25 },
                scale: { duration: 1.8, ease: [0.32, 0.72, 0, 1] },
                opacity: { duration: 1.5, ease: "easeOut" },
                rotate: { duration: 1.8, ease: [0.32, 0.72, 0, 1] },
                y: isCenterCard ? {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}
              }}
              style={{ 
                position: 'absolute',
                zIndex: position.zIndex,
                willChange: isCenterCard ? 'transform' : 'auto'
              }}
              className={isShuffling ? 'pointer-events-none' : ''}
            >
              <div className="relative">
                <div 
                  className={`${isCenterCard ? 'w-[280px]' : 'w-[260px]'} bg-white dark:bg-gray-800 rounded-lg p-3 transform ${
                    isCenterCard ? 'shadow-2xl' : 'shadow-lg'
                  } ${isCenterCard ? 'hover:scale-105 transition-transform duration-[800ms]' : ''} relative ${
                    !isCenterCard ? 'opacity-95 cursor-pointer hover:opacity-100 transition-opacity duration-600' : ''
                  }`}
                  onClick={!isCenterCard ? () => {
                    setIsShuffling(true);
                    setTimeout(() => {
                      setCurrentIndex(index);
                      setIsShuffling(false);
                    }, 1000);
                  } : undefined}
                style={{ 
                  transformStyle: 'preserve-3d',
                  boxShadow: isCenterCard 
                    ? '0 0 35px rgba(0, 230, 24, 0.4), 0 0 70px rgba(0, 230, 24, 0.2), inset 0 0 20px rgba(0, 230, 24, 0.1)' 
                    : 'none',
                  background: isCenterCard 
                    ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)' 
                    : undefined
                }}
                onMouseMove={isCenterCard ? (e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = (y - centerY) / 10;
                  const rotateY = (centerX - x) / 10;
                  e.currentTarget.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
                } : undefined}
                onMouseLeave={isCenterCard ? (e) => {
                  e.currentTarget.style.transform = 'rotateX(0) rotateY(0) scale(1)';
                } : undefined}
              >
                {isCenterCard && (
                  <>
                    <div className="absolute -inset-1 bg-[#00E618] rounded-lg blur opacity-50 animate-pulse" />
                    <div className="absolute -inset-0.5 bg-[#00E618] rounded-lg opacity-35" />
                    <ParticleEffect active={true} />
                  </>
                )}
                <div className="relative aspect-square bg-black overflow-hidden rounded-md">
                  <Image
                    src={nft.imageUrl}
                    alt={nft.name}
                    width={isCenterCard ? 280 : 260}
                    height={isCenterCard ? 280 : 260}
                    className={`object-cover w-full h-full ${!isCenterCard ? 'opacity-90' : ''}`}
                    priority={isCenterCard}
                  />
                  {isCenterCard && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  )}
                  {/* Collection Badge */}
                  <div className="absolute top-2 left-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      nft.name === 'Azur Guardian' 
                        ? 'bg-blue-500/80 text-white' 
                        : nft.name === 'Fuddies'
                        ? 'bg-purple-500/80 text-white'
                        : nft.name === 'Machines'
                        ? 'bg-green-500/80 text-white'
                        : nft.name === 'Puggies'
                        ? 'bg-pink-500/80 text-white'
                        : 'bg-orange-500/80 text-white'
                    }`}>
                      {nft.owner}
                    </div>
                  </div>
                </div>
                {isCenterCard && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">{nft.name}</h3>
                        <p className="text-xs text-gray-500">{nft.owner}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Reflection effect */}
              {isCenterCard && (
                <div className="absolute top-full mt-2 w-full pointer-events-none">
                  <div 
                    className="w-[280px] h-[280px] relative opacity-25 transform scale-y-[-1]"
                    style={{
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%)',
                    }}
                  >
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="relative aspect-square bg-black overflow-hidden rounded-md">
                        <Image
                          src={nft.imageUrl}
                          alt=""
                          width={280}
                          height={280}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {!tournamentId && (
        <>
          <div className="text-center mt-4 text-sm text-gray-500">
            Featured NFT Collections • Join tournaments to compete
          </div>
          <div className="flex justify-center mt-3 gap-2">
            {nfts.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1.5 rounded-full ${
                  index === currentIndex ? 'w-8 bg-gray-800' : 'w-1.5 bg-gray-300'
                }`}
                animate={{
                  scale: index === currentIndex ? 1.2 : 1
                }}
              />
            ))}
          </div>
        </>
      )}
      </div>
    </MotionConfig>
  );
};

export default NFTCarousel;