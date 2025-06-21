'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSuiClient } from '@mysten/dapp-kit';
import { castToSuiClient } from '@/types/sui-client';
import { TournamentService, Tournament } from '@/services/tournamentService';

interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  displayName: string;
  avatarUrl: string;
  score: number;
  prize?: string;
}

interface TournamentLeaderboardProps {
  tournamentId: string;
  isEnded?: boolean;
  maxEntries?: number;
  showPrizePool?: boolean;
}

export default function TournamentLeaderboard({ 
  tournamentId, 
  isEnded = false,
  maxEntries = 10,
  showPrizePool = true
}: TournamentLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tournamentDetails, setTournamentDetails] = useState<Tournament | null>(null);
  
  // Initialize the tournament service
  const suiClient = useSuiClient();
  const tournamentService = useMemo(() => new TournamentService(castToSuiClient(suiClient)), [suiClient]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Fetch tournament details
        const tournament = await tournamentService.getTournamentById(tournamentId);
        setTournamentDetails(tournament || null);
        
        // Fetch tournament entries
        const nftEntries = await tournamentService.getTournamentEntries(tournamentId);
        
        // Convert NFT entries to leaderboard entries
        const leaderboardEntries: LeaderboardEntry[] = nftEntries.map(entry => {
          // Truncate wallet address for display
          const displayAddress = entry.owner.length > 10 
            ? `${entry.owner.substring(0, 6)}...${entry.owner.substring(entry.owner.length - 4)}` 
            : entry.owner;
          
          // Generate display name from address if not available
          const displayName = `Player ${entry.rank}`;
          
          // Determine prize if tournament has ended
          let prize: string | undefined;
          if (isEnded && tournament?.winners) {
            const winner = tournament.winners.find(w => w.nftId === entry.nftId);
            if (winner) {
              prize = `${winner.prize} SUI`;
            }
          }
          
          return {
            rank: entry.rank || 0,
            walletAddress: displayAddress,
            displayName,
            avatarUrl: `/images/avatars/avatar-${(entry.rank || 0) % 5 + 1}.png`,
            score: entry.votes,
            prize
          };
        });
        
        setEntries(leaderboardEntries);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId) {
      fetchLeaderboard();
    }
  }, [tournamentId, isEnded, tournamentService]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-ink-50 to-blue-50 dark:from-ink-900/30 dark:to-blue-900/30 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {isEnded ? 'Final Results' : 'Current Standings'}
        </h3>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isEnded 
              ? 'Tournament has ended. Congratulations to all winners!' 
              : 'Live leaderboard - updated in real-time'}
          </p>
          
          {showPrizePool && tournamentDetails && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-3 py-1 rounded-full">
              Prize Pool: {tournamentDetails.prizePool || '0'} SUI
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-6 flex flex-col space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="divide-y divide-gray-100 dark:divide-gray-700"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {entries.slice(0, maxEntries).map((entry) => (
            <motion.div 
              key={entry.rank} 
              className="flex items-center p-4"
              variants={itemVariants}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm font-semibold
                ${entry.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400' : 
                  entry.rank === 2 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 
                    entry.rank === 3 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
              >
                {entry.rank}
              </div>
              
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 mr-3">
                <Image 
                  src={entry.avatarUrl} 
                  alt={entry.displayName}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback for missing images
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/avatars/default-avatar.png';
                  }}
                />
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{entry.displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{entry.walletAddress}</p>
              </div>
              
              <div className="flex flex-col items-end">
                <p className="font-semibold text-gray-900 dark:text-white">{entry.score.toLocaleString()} pts</p>
                {entry.prize && (
                  <span className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mt-1">
                    {entry.prize}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {!loading && entries.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No entries yet. Be the first to join!</p>
        </div>
      )}
    </div>
  );
}
