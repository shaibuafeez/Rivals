'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

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
}

export default function TournamentLeaderboard({ tournamentId, isEnded = false }: TournamentLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would fetch data from the blockchain or API
        // For now, we'll use mock data
        setTimeout(() => {
          const mockData: LeaderboardEntry[] = [
            {
              rank: 1,
              walletAddress: '0x7a12...8f9d',
              displayName: 'CryptoKing',
              avatarUrl: '/images/avatars/avatar-1.png',
              score: 2850,
              prize: '500 SUI'
            },
            {
              rank: 2,
              walletAddress: '0x3b45...2e7c',
              displayName: 'NFT_Collector',
              avatarUrl: '/images/avatars/avatar-2.png',
              score: 2340,
              prize: '250 SUI'
            },
            {
              rank: 3,
              walletAddress: '0x9d78...4a1b',
              displayName: 'BlockchainNinja',
              avatarUrl: '/images/avatars/avatar-3.png',
              score: 1980,
              prize: '100 SUI'
            },
            {
              rank: 4,
              walletAddress: '0x5f23...9c6d',
              displayName: 'CryptoArtist',
              avatarUrl: '/images/avatars/avatar-4.png',
              score: 1750
            },
            {
              rank: 5,
              walletAddress: '0x2a67...3f8e',
              displayName: 'TokenMaster',
              avatarUrl: '/images/avatars/avatar-5.png',
              score: 1620
            }
          ];
          setEntries(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [tournamentId]);

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">
          {isEnded ? 'Final Results' : 'Current Standings'}
        </h3>
        <p className="text-sm text-gray-600">
          {isEnded 
            ? 'Tournament has ended. Congratulations to all winners!' 
            : 'Live leaderboard - updated in real-time'}
        </p>
      </div>

      {loading ? (
        <div className="p-6 flex flex-col space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="divide-y divide-gray-100"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {entries.map((entry) => (
            <motion.div 
              key={entry.rank} 
              className="flex items-center p-4"
              variants={itemVariants}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm font-semibold
                ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                  entry.rank === 2 ? 'bg-gray-100 text-gray-700' : 
                    entry.rank === 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500'}`}
              >
                {entry.rank}
              </div>
              
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 mr-3">
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
                <p className="font-medium text-gray-900">{entry.displayName}</p>
                <p className="text-xs text-gray-500">{entry.walletAddress}</p>
              </div>
              
              <div className="flex flex-col items-end">
                <p className="font-semibold text-gray-900">{entry.score.toLocaleString()} pts</p>
                {entry.prize && (
                  <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full mt-1">
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
          <p className="text-gray-500">No entries yet. Be the first to join!</p>
        </div>
      )}
    </div>
  );
}
