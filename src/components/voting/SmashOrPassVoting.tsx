import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion';

// Custom interface for entries that matches both NFTEntry and TournamentEntry
interface VotingEntry {
  nftId: string;
  name?: string;
  image?: string;
  imageUrl?: string; // Added to support TournamentEntry format
  votes?: number;
  owner?: string; // Optional to accommodate TournamentEntry
  rank?: number;
}

interface SmashOrPassVotingProps {
  entries: VotingEntry[];
  onVote: (nftId: string) => Promise<void>;
  isVoting: boolean;
  fallbackImage: string;
}

const SmashOrPassVoting: React.FC<SmashOrPassVotingProps> = ({
  entries,
  onVote,
  isVoting,
  fallbackImage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [voteResult, setVoteResult] = useState<{ id: string; result: 'smash' | 'pass' } | null>(null);
  
  // Default fallback image if none provided - using a local avatar image
  const defaultFallbackImage = '/images/avatars/telegram-cloud-photo-size-1-5037512497065733520-y.jpg';
  
  // Get current entry or reset to first entry if at the end
  const currentEntry = entries.length > 0 ? 
    (currentIndex < entries.length ? entries[currentIndex] : entries[0]) : 
    undefined;
    
  // Reset to first entry if we're at the end
  useEffect(() => {
    if (currentIndex >= entries.length && entries.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, entries.length]);
  
  // Debug logging for image sources
  console.log('Current entry:', currentEntry);
  console.log('Image source:', currentEntry?.image);
  console.log('Fallback image:', fallbackImage);
  console.log('Default fallback image:', defaultFallbackImage);
  console.log('Current index:', currentIndex, 'Total entries:', entries.length);
  console.log('All entries:', entries);
  
  // Motion values for card animations
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30]);
  
  // Background color based on swipe direction
  const backgroundColor = useTransform(
    x,
    [-300, -100, 0, 100, 300],
    ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)', 'rgba(0, 0, 0, 0)', 'rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.2)']
  );
  
  // Animation controls
  const controls = useAnimation();
  
  // Handle vote
  const handleVote = async (nftId: string, voteType: 'smash' | 'pass') => {
    if (voteType === 'smash') {
      setVoteResult({ id: nftId, result: 'smash' });
      await onVote(nftId);
    } else {
      setVoteResult({ id: nftId, result: 'pass' });
    }
    
    // Move to next card after a delay
    setTimeout(() => {
      setVoteResult(null);
      if (currentIndex < entries.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Reset to first card if we've gone through all entries
        setCurrentIndex(0);
      }
    }, 1000);
  };
  
  // Handle drag end
  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (!currentEntry) return;
    
    if (info.offset.x > 100) {
      controls.start({ x: 500, opacity: 0 });
      handleVote(currentEntry.nftId, 'smash');
    } else if (info.offset.x < -100) {
      controls.start({ x: -500, opacity: 0 });
      handleVote(currentEntry.nftId, 'pass');
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };
  
  // Create transform values for opacity based on swipe position
  const passOpacity = useTransform(x, [-200, -40, 0], [1, 0.5, 0]);
  const smashOpacity = useTransform(x, [0, 40, 200], [0, 0.5, 1]);
  
  // No entries case
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-600 dark:text-gray-300 text-center">No NFT entries available for voting.</p>
      </div>
    );
  }
  
  // No current entry case
  if (!currentEntry) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-600 dark:text-gray-300 text-center">Loading NFT entry...</p>
      </div>
    );
  }
  
  return (
    <div className="relative w-full max-w-md mx-auto h-[550px] mb-8 flex flex-col items-center justify-center">
      {/* Background that changes color based on swipe direction */}
      <motion.div 
        className="absolute inset-0 rounded-xl"
        style={{ backgroundColor }}
      />
      
      {/* Card Stack - Center the current card with a stack effect */}
      <div className="relative w-full h-[400px] flex items-center justify-center">
        {/* Show a hint of the next card behind current card */}
        {entries.length > 1 && (
          <motion.div 
            className="absolute w-[90%] h-[380px] bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl dark:shadow-gray-900/50 z-0"
            style={{ 
              y: 10,
              scale: 0.95,
              opacity: 0.5,
              filter: 'blur(2px)'
            }}
          />
        )}
        
        {/* Main Card */}
        <AnimatePresence mode="wait">
          {currentEntry && (
            <motion.div
              key={currentEntry.nftId}
              className="absolute w-full h-[400px] bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl dark:shadow-gray-900/50 z-10"
              style={{ 
                x,
                rotate,
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              animate={controls}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              exit={{ scale: 0.8, opacity: 0, y: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* NFT Image */}
              <div className="relative w-full h-[320px] bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {/* Using standard img tag instead of Next.js Image for better compatibility */}
                <img
                  src={currentEntry.image || currentEntry.imageUrl || "/images/avatars/telegram-cloud-photo-size-1-5037512497065733520-y.jpg"}
                  alt={currentEntry.name || `Azur Guardian NFT`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    console.log('Image failed to load, using fallback');
                    // Fallback to a placeholder if the current one fails
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.src = '/images/nft-placeholder.png';
                  }}
              />
              
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/20 to-transparent opacity-60"></div>
              
              {/* Vote result overlay */}
              {voteResult && voteResult.id === currentEntry.nftId && (
                <motion.div 
                  className={`absolute inset-0 flex items-center justify-center ${
                    voteResult.result === 'smash' 
                      ? 'bg-green-500 bg-opacity-70' 
                      : 'bg-red-500 bg-opacity-70'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-white dark:bg-gray-900 rounded-full p-4 shadow-lg dark:shadow-gray-900/50"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-3xl font-bold">
                      {voteResult.result === 'smash' ? '🔥 SMASH!' : '❌ PASS!'}
                    </span>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Direction indicators */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-6">
                <motion.div 
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xl"
                  style={{ opacity: passOpacity }}
                >
                  PASS
                </motion.div>
                <motion.div 
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xl"
                  style={{ opacity: smashOpacity }}
                >
                  SMASH
                </motion.div>
              </div>
            </div>
            
            {/* NFT Info */}
            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {currentEntry.name || `NFT Entry ${currentIndex + 1}`}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 truncate">
                No description available
              </p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Current Votes: {currentEntry.votes || 0}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Rank: #{currentEntry.rank || 'N/A'}
                </span>
              </div>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Action buttons - Floating circular buttons */}
      <div className="mt-6 flex justify-center space-x-16 z-20">
        <motion.button 
          onClick={() => currentEntry && handleVote(currentEntry.nftId, 'pass')}
          className="w-16 h-16 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center shadow-lg dark:shadow-gray-900/50 focus:outline-none"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={isVoting || !currentEntry}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
        
        <motion.button
          onClick={() => currentEntry && handleVote(currentEntry.nftId, 'smash')}
          className="w-16 h-16 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center shadow-lg dark:shadow-gray-900/50 focus:outline-none"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={isVoting || !currentEntry}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>
      </div>
      
      {/* Progress Bar with animation */}
      <motion.div 
        className="mt-6 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${((currentIndex + 1) / entries.length) * 100}%` }}
          initial={{ width: `${(currentIndex / entries.length) * 100}%` }}
          animate={{ width: `${((currentIndex + 1) / entries.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        ></motion.div>
      </motion.div>
      
      {/* Entry counter */}
      <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        {currentIndex + 1} of {entries.length}
      </div>
    </div>
  );
};

export default SmashOrPassVoting;
