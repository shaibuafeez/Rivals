'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sword, Clock, Users, TrendingUp } from 'lucide-react';
import { BracketMatch } from './TournamentBracket';
import confetti from 'canvas-confetti';

interface BattleArenaProps {
  currentMatch: BracketMatch | null;
  onVote: (matchId: string, nftId: string) => Promise<void>;
  userVoted?: boolean;
  timeRemaining?: string;
  votingInProgress?: boolean;
}

export default function BattleArena({ 
  currentMatch, 
  onVote,
  userVoted = false,
  timeRemaining,
  votingInProgress = false
}: BattleArenaProps) {
  const [voting, setVoting] = useState(false);
  const [selectedNft, setSelectedNft] = useState<string | null>(null);
  const [showBattleIntro, setShowBattleIntro] = useState(true);

  useEffect(() => {
    if (currentMatch) {
      setShowBattleIntro(true);
      setTimeout(() => setShowBattleIntro(false), 2000);
    }
  }, [currentMatch?.id]);

  const handleVote = async (nftId: string) => {
    if (!currentMatch || userVoted || voting || votingInProgress) return;
    
    setVoting(true);
    setSelectedNft(nftId);
    
    try {
      await onVote(currentMatch.id, nftId);
      
      // Celebrate the vote
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: nftId === currentMatch.nft1?.id ? ['#10B981'] : ['#3B82F6']
      });
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setVoting(false);
    }
  };

  if (!currentMatch) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4 opacity-20">⚔️</div>
        <h3 className="text-xl font-bold text-white mb-2 uppercase">No Active Battle</h3>
        <p className="text-gray-400">Waiting for the next match to begin...</p>
      </div>
    );
  }

  const totalVotes = (currentMatch.nft1?.votes || 0) + (currentMatch.nft2?.votes || 0);
  const nft1Percentage = totalVotes > 0 ? ((currentMatch.nft1?.votes || 0) / totalVotes) * 100 : 50;
  const nft2Percentage = totalVotes > 0 ? ((currentMatch.nft2?.votes || 0) / totalVotes) * 100 : 50;

  return (
    <>
      {/* Battle Intro Animation */}
      <AnimatePresence>
        {showBattleIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-8xl mb-4"
              >
                ⚔️
              </motion.div>
              <h2 className="text-4xl font-bold text-white uppercase tracking-wider">
                Battle {currentMatch.matchNumber}
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Match Header */}
        <div className="text-center mb-8">
          <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">
            Round {currentMatch.round} - Match {currentMatch.matchNumber}
          </h3>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono">{timeRemaining || '---'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">{totalVotes} votes</span>
            </div>
          </div>
        </div>

        {/* Battle Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* NFT 1 */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className={`relative border-2 transition-all duration-300 ${
              selectedNft === currentMatch.nft1?.id 
                ? 'border-green-500 shadow-lg shadow-green-500/20' 
                : 'border-gray-800 hover:border-gray-700'
            }`}>
              {/* NFT Image */}
              <div className="relative aspect-square bg-gray-900 overflow-hidden">
                {currentMatch.nft1 && (
                  <Image
                    src={currentMatch.nft1.imageUrl}
                    alt={currentMatch.nft1.name}
                    fill
                    className="object-cover"
                  />
                )}
                
                {/* Vote Overlay */}
                {!userVoted && (
                  <motion.button
                    onClick={() => handleVote(currentMatch.nft1?.id || '')}
                    disabled={voting || votingInProgress}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute inset-0 bg-black/80 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  >
                    <div className="text-center">
                      {(voting || votingInProgress) && selectedNft === currentMatch.nft1?.id ? (
                        <>
                          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-2 mx-auto" />
                          <span className="text-xl font-bold text-white uppercase tracking-wider">
                            Voting...
                          </span>
                        </>
                      ) : (
                        <>
                          <Sword className="w-12 h-12 text-white mb-2 mx-auto" />
                          <span className="text-xl font-bold text-white uppercase tracking-wider">
                            Vote
                          </span>
                        </>
                      )}
                    </div>
                  </motion.button>
                )}
              </div>

              {/* NFT Info */}
              <div className="p-4 bg-black">
                <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
                  {currentMatch.nft1?.name}
                </h4>
                
                {/* Vote Bar */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Votes</span>
                    <span className="text-sm font-bold text-white">{currentMatch.nft1?.votes || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${nft1Percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-green-500 to-green-400"
                    />
                  </div>
                </div>
                
                {/* Percentage */}
                <div className="text-center">
                  <span className="text-3xl font-bold" style={{ color: nft1Percentage > 50 ? 'var(--accent-gold)' : 'white' }}>
                    {nft1Percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Leading Indicator */}
            {nft1Percentage > 50 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 font-bold text-sm uppercase"
              >
                Leading
              </motion.div>
            )}
          </motion.div>

          {/* VS Divider */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 lg:block hidden">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-20 h-20 bg-black border-4 border-white rounded-full flex items-center justify-center"
            >
              <span className="text-2xl font-black text-white">VS</span>
            </motion.div>
          </div>

          {/* Mobile VS */}
          <div className="lg:hidden flex items-center justify-center py-4">
            <div className="w-16 h-16 bg-black border-2 border-white rounded-full flex items-center justify-center">
              <span className="text-xl font-black text-white">VS</span>
            </div>
          </div>

          {/* NFT 2 */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className={`relative border-2 transition-all duration-300 ${
              selectedNft === currentMatch.nft2?.id 
                ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                : 'border-gray-800 hover:border-gray-700'
            }`}>
              {/* NFT Image */}
              <div className="relative aspect-square bg-gray-900 overflow-hidden">
                {currentMatch.nft2 && (
                  <Image
                    src={currentMatch.nft2.imageUrl}
                    alt={currentMatch.nft2.name}
                    fill
                    className="object-cover"
                  />
                )}
                
                {/* Vote Overlay */}
                {!userVoted && (
                  <motion.button
                    onClick={() => handleVote(currentMatch.nft2?.id || '')}
                    disabled={voting || votingInProgress}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute inset-0 bg-black/80 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  >
                    <div className="text-center">
                      {(voting || votingInProgress) && selectedNft === currentMatch.nft2?.id ? (
                        <>
                          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-2 mx-auto" />
                          <span className="text-xl font-bold text-white uppercase tracking-wider">
                            Voting...
                          </span>
                        </>
                      ) : (
                        <>
                          <Sword className="w-12 h-12 text-white mb-2 mx-auto" />
                          <span className="text-xl font-bold text-white uppercase tracking-wider">
                            Vote
                          </span>
                        </>
                      )}
                    </div>
                  </motion.button>
                )}
              </div>

              {/* NFT Info */}
              <div className="p-4 bg-black">
                <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
                  {currentMatch.nft2?.name}
                </h4>
                
                {/* Vote Bar */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Votes</span>
                    <span className="text-sm font-bold text-white">{currentMatch.nft2?.votes || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${nft2Percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                    />
                  </div>
                </div>
                
                {/* Percentage */}
                <div className="text-center">
                  <span className="text-3xl font-bold" style={{ color: nft2Percentage > 50 ? 'var(--accent-gold)' : 'white' }}>
                    {nft2Percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Leading Indicator */}
            {nft2Percentage > 50 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 font-bold text-sm uppercase"
              >
                Leading
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* User Voted Message */}
        {userVoted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center p-4 bg-green-500/10 border border-green-500/30"
          >
            <p className="text-green-500 font-bold uppercase">✓ You voted in this match</p>
            <p className="text-gray-400 text-sm mt-1">Wait for the next round to vote again</p>
          </motion.div>
        )}
        
        {/* Voting in Progress Indicator */}
        {votingInProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center p-4 bg-blue-500/10 border border-blue-500/30"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-blue-500 font-bold uppercase">Submitting vote to blockchain...</p>
            </div>
            <p className="text-gray-400 text-sm mt-1">Please wait while your transaction is processed</p>
          </motion.div>
        )}
      </div>
    </>
  );
}