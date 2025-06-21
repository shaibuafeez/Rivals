'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, RotateCcw, Trophy, Flame, Users } from 'lucide-react';
import Image from 'next/image';
import { useWallet } from '@/hooks/useWallet';
import toast from 'react-hot-toast';
import { SuiClient } from '@mysten/sui/client';
import { TournamentService, NFTEntry } from '@/services/tournamentService';
import { SimpleTournamentService } from '@/services/simpleTournamentService';

interface AnimatedSmashOrPassVotingProps {
  tournamentId: string;
  nftEntries: NFTEntry[];
  suiClient: SuiClient;
}

// No mock data - use real blockchain data only

// Helper function to ensure proper image URL
const getImageUrl = (entry: any): string => {
  const url = entry?.imageUrl || entry?.image || '';
  
  // If it's an IPFS URL without gateway, add one
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  
  // If no URL or invalid, return placeholder
  if (!url || url === '') {
    return '/images/nft-placeholder.png';
  }
  
  return url;
};

export default function AnimatedSmashOrPassVoting({
  tournamentId,
  nftEntries,
  suiClient
}: AnimatedSmashOrPassVotingProps) {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS
  const { isConnected, address, executeTransaction } = useWallet();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [entries, setEntries] = useState<NFTEntry[]>([]);
  const [, setVotedEntries] = useState<Set<string>>(new Set());
  const [isVoting, setIsVoting] = useState(false);
  const [voteResults, setVoteResults] = useState<{ id: string; action: 'smash' | 'pass' }[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const simpleTournamentService = useMemo(() => {
    const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID!;
    return new SimpleTournamentService(suiClient, PACKAGE_ID);
  }, [suiClient]);
  
  // Motion values for card animation - must be called unconditionally
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  
  // Color overlays based on swipe direction - must be called unconditionally  
  const passOverlay = useTransform(x, [-300, -50, 0], [0.8, 0.3, 0]);
  const smashOverlay = useTransform(x, [0, 50, 300], [0, 0.3, 0.8]);
  
  // Scale transforms for overlay animations - must be called unconditionally
  const passScale = useTransform(passOverlay, [0, 0.8], [0.5, 1.2]);
  const smashScale = useTransform(smashOverlay, [0, 0.8], [0.5, 1.2]);
  
  // useEffect must be called unconditionally
  useEffect(() => {
    console.log('AnimatedSmashOrPassVoting - Received nftEntries:', nftEntries);
    console.log('Number of entries:', nftEntries?.length || 0);
    
    // Use only real blockchain data - no mock data fallback
    if (nftEntries && nftEntries.length > 0) {
      setEntries(nftEntries);
      console.log('Set entries to:', nftEntries);
      // Log first entry details for debugging
      if (nftEntries[0]) {
        console.log('First entry details:', {
          name: nftEntries[0].name,
          imageUrl: nftEntries[0].imageUrl,
          image: nftEntries[0].image,
          votes: nftEntries[0].votes
        });
      }
    } else {
      setEntries([]);
      console.log('No entries available, set to empty array');
    }
  }, [nftEntries]);
  
  // Derived state - computed after all hooks
  const currentEntry = entries[currentIndex];
  const nextEntry = entries[currentIndex + 1];
  
  const handleVote = async (action: 'smash' | 'pass') => {
    if (!currentEntry || isVoting || !isConnected || !address) return;
    
    setIsVoting(true);
    
    try {
      if (action === 'smash') {
        // Create vote transaction
        console.log('🗳️ Creating vote transaction for NFT:', currentEntry.nftId);
        const tx = simpleTournamentService.voteTransaction(tournamentId, currentEntry.nftId);
        
        // Set sender on transaction
        tx.setSender(address);
        
        // Execute the transaction
        const result = await executeTransaction(tx);
        
        console.log('✅ Vote transaction result:', result);
        
        if (result?.effects?.status?.status === 'success') {
          toast.success(
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
              <span className="font-medium">Voted!</span>
            </div>
          );
          
          // Track the vote
          setVoteResults(prev => [...prev, { id: currentEntry.nftId, action }]);
          setVotedEntries(prev => new Set([...prev, currentEntry.nftId]));
        } else {
          throw new Error('Transaction failed');
        }
      } else {
        // Just skip to next without voting
        toast(
          <div className="flex items-center gap-2">
            <X className="w-5 h-5 text-gray-500" />
            <span>Skipped</span>
          </div>
        );
      }
      
      // Move to next entry
      setTimeout(() => {
        if (currentIndex < entries.length - 1) {
          setCurrentIndex(prev => prev + 1);
          x.set(0);
        } else {
          setShowResults(true);
        }
      }, 300);
      
    } catch (error: any) {
      console.error('Error voting:', error);
      if (error.message?.includes('EAlreadyVoted')) {
        toast.error('You have already voted in this tournament');
      } else {
        toast.error('Failed to submit vote. Try again!');
      }
    } finally {
      setIsVoting(false);
    }
  };
  
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      handleVote('smash');
    } else if (info.offset.x < -threshold) {
      handleVote('pass');
    } else {
      x.set(0);
    }
  };
  
  const resetVoting = () => {
    setCurrentIndex(0);
    setVotedEntries(new Set());
    setVoteResults([]);
    setShowResults(false);
    x.set(0);
  };
  
  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isVoting || !currentEntry || showResults || !isConnected) return;
      
      if (e.key === 'ArrowLeft') {
        handleVote('pass');
      } else if (e.key === 'ArrowRight') {
        handleVote('smash');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVoting, currentIndex, showResults, entries.length, isConnected]);
  
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Tournament Entries</h3>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 max-w-md">
          This tournament is waiting for participants to join and submit their NFTs.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <p className="text-blue-700 dark:text-blue-300 font-medium mb-2">
            Ready to Participate?
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use the &quot;Enter Tournament&quot; button above to register your NFT and join the competition.
          </p>
        </div>
      </div>
    );
  }
  
  if (showResults) {
    const smashCount = voteResults.filter(r => r.action === 'smash').length;
    const passCount = voteResults.filter(r => r.action === 'pass').length;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Voting Complete!</h3>
        
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-2 mx-auto">
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Skipped</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{passCount}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full mb-2 mx-auto">
              <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Voted For</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{smashCount}</p>
          </div>
        </div>
        
        <motion.button
          onClick={resetVoting}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ink-600 to-blue-600 text-white rounded-lg font-medium hover:from-ink-700 hover:to-blue-700 transition-all mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5" />
          Vote Again
        </motion.button>
      </motion.div>
    );
  }
  
  if (!currentEntry) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink-600"></div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Vote on Tournament Entries
        </h2>
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <motion.div 
              className="flex items-center gap-1"
              animate={{ x: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-gray-500">←</span>
              <X className="w-3 h-3 text-gray-500" />
            </motion.div>
            <span className="text-gray-500 dark:text-gray-400">Skip (no vote)</span>
          </div>
          <span className="text-gray-400 dark:text-gray-600">|</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Vote for this NFT</span>
            <motion.div 
              className="flex items-center gap-1"
              animate={{ x: [2, -2, 2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-3 h-3 text-pink-500" fill="currentColor" />
              <span className="text-gray-500">→</span>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Card Stack Container - Desktop Optimized */}
      <div className="relative w-full max-w-sm mx-auto h-[500px] perspective-1000">
        
        {/* Next Card (Behind) */}
        {nextEntry && (
          <motion.div
            className="absolute inset-0 w-full h-full"
            initial={{ scale: 0.95, opacity: 0.7 }}
            animate={{ scale: 0.95, opacity: 0.7 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full border border-gray-200 dark:border-gray-700">
              <div className="relative h-2/3">
                <Image
                  src={getImageUrl(nextEntry)}
                  alt={nextEntry.name || 'NFT'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-4 h-1/3 flex flex-col justify-center">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {nextEntry.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Next up...
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Current Card (Front) */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity }}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden h-full border border-gray-200 dark:border-gray-700 relative">
            
            {/* Skip Overlay - More dramatic effect */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              style={{ opacity: passOverlay }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/80 to-gray-900/80" />
              <motion.div
                className="relative"
                style={{ scale: passScale }}
              >
                <div className="absolute inset-0 bg-red-500 blur-xl opacity-50" />
                <div className="relative bg-white rounded-full p-6 shadow-2xl">
                  <X className="w-16 h-16 text-red-500" strokeWidth={3} />
                </div>
                <motion.div 
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-full"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: passOverlay.get() > 0.5 ? 1 : 0, y: 0 }}
                >
                  <span className="text-white font-bold text-lg">SKIP</span>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Vote Overlay - More exciting effect */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              style={{ opacity: smashOverlay }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/80 via-blue-500/80 to-ink-600/80" />
              <motion.div
                className="relative"
                style={{ scale: smashScale }}
              >
                <div className="absolute inset-0 bg-green-400 blur-xl opacity-70 animate-pulse" />
                <div className="relative bg-white rounded-full p-6 shadow-2xl">
                  <Heart className="w-16 h-16 text-transparent bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text fill-current" strokeWidth={3} />
                </div>
                <motion.div 
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 rounded-full shadow-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: smashOverlay.get() > 0.5 ? 1 : 0, y: 0 }}
                >
                  <span className="text-white font-bold text-lg">VOTE!</span>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Main Content */}
            <div className="relative h-2/3">
              <Image
                src={getImageUrl(currentEntry)}
                alt={currentEntry.name || 'NFT'}
                fill
                className="object-cover"
                priority
                unoptimized
                onError={(e) => {
                  console.error('Image failed to load:', getImageUrl(currentEntry));
                  (e.target as HTMLImageElement).src = '/images/nft-placeholder.png';
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* Stats Badge */}
              <div className="absolute top-3 right-3 bg-black/60 dark:bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span>{currentEntry.votes}</span>
                </div>
              </div>
              
              {/* Rank Badge */}
              {currentEntry.rank && (
                <div className="absolute top-4 left-4 bg-yellow-500 dark:bg-yellow-600 rounded-lg px-3 py-1 text-black dark:text-gray-900 text-sm font-bold">
                  #{currentEntry.rank}
                </div>
              )}
            </div>
            
            {/* Info Section */}
            <div className="p-4 h-1/3 flex flex-col justify-center bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">
                {currentEntry.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate mb-1">
                Owner: {currentEntry.owner?.substring(0, 8)}...
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Current Votes: {currentEntry.votes}</span>
                {currentEntry.rank && <span>Rank: #{currentEntry.rank}</span>}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Action Buttons - Enhanced with better animations */}
      <div className="flex justify-center items-center gap-12 mt-6">
        {/* Pass Button */}
        <motion.div className="relative">
          <motion.button
            onClick={() => handleVote('pass')}
            disabled={isVoting}
            className="relative w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center shadow-xl text-white disabled:opacity-50 overflow-hidden group"
            whileHover={{ scale: 1.15, rotate: -5 }}
            whileTap={{ scale: 0.85 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <X className="w-8 h-8 relative z-10" strokeWidth={3} />
          </motion.button>
          <motion.span 
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            Next
          </motion.span>
        </motion.div>
        
        {/* Smash Button */}
        <motion.div className="relative">
          <motion.button
            onClick={() => handleVote('smash')}
            disabled={isVoting}
            className="relative w-20 h-20 bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl text-white disabled:opacity-50 overflow-hidden group"
            whileHover={{ 
              scale: 1.2, 
              rotate: 5,
              boxShadow: "0 20px 40px -10px rgba(236, 72, 153, 0.5)"
            }}
            whileTap={{ scale: 0.85 }}
          >
            {/* Animated background effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 via-pink-500/30 to-ink-600/30"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            {isVoting ? (
              <div className="w-10 h-10 relative z-10">
                <div className="animate-spin rounded-full h-full w-full border-4 border-white border-t-transparent" />
              </div>
            ) : (
              <Heart className="w-10 h-10 relative z-10 drop-shadow-lg" strokeWidth={2.5} fill="white" />
            )}
            
            {/* Pulse effect on hover */}
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-white/30"
              initial={{ scale: 1, opacity: 0 }}
              whileHover={{
                scale: [1, 1.3, 1.2],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />
          </motion.button>
          <motion.span 
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            Vote
          </motion.span>
        </motion.div>
      </div>
      
      {/* Keyboard Hint */}
      <motion.div 
        className="text-center mt-4 text-xs text-gray-400 dark:text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="inline-flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300 font-mono border border-gray-200 dark:border-gray-700">←</kbd>
          <span>or</span>
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300 font-mono border border-gray-200 dark:border-gray-700">→</kbd>
          <span>arrow keys to vote</span>
        </span>
      </motion.div>
      
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {currentIndex + 1} of {entries.length}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {Math.round(((currentIndex + 1) / entries.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-ink-500 to-blue-500 h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentIndex + 1) / entries.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}