'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { NFTEntry } from '@/services/tournamentService';

interface NFTLeaderboardProps {
  nftEntries: NFTEntry[];
  title?: string;
  maxEntries?: number;
}

export default function NFTLeaderboard({ 
  nftEntries, 
  title = 'Top NFTs',
  maxEntries = 5
}: NFTLeaderboardProps) {
  // Sort entries by vote count and limit to maxEntries
  const topEntries = useMemo(() => {
    return [...nftEntries]
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, maxEntries);
  }, [nftEntries, maxEntries]);

  // Animation variants
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
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {topEntries.length > 0 
            ? 'Current standings based on votes' 
            : 'No entries yet'}
        </p>
      </div>
      
      {topEntries.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No entries yet. Be the first to participate!</p>
        </div>
      ) : (
        <motion.div 
          className="divide-y divide-gray-100 dark:divide-gray-700"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {topEntries.map((entry, index) => (
            <motion.div 
              key={entry.nftId}
              className="flex items-center p-4"
              variants={itemVariants}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm font-semibold
                ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 
                  index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 
                    index === 2 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'}`}
              >
                {index + 1}
              </div>
              
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mr-3">
                {(entry.image || entry.imageUrl) ? (
                  <Image 
                    src={entry.image || entry.imageUrl || '/images/nft-placeholder.png'} 
                    alt={`NFT ${entry.nftId}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback for missing images
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/nft-placeholder.png';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">NFT #{entry.nftId ? entry.nftId.slice(-4) : '????'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {entry.owner ? `Owner: ${entry.owner.slice(0, 6)}...${entry.owner.slice(-4)}` : 'Owner: Unknown'}
                </p>
              </div>
              
              <div className="flex flex-col items-end">
                <p className="font-semibold text-gray-900 dark:text-white">{(entry.votes || 0).toLocaleString()} votes</p>
                {index < 3 && (
                  <span className={`text-xs px-2 py-1 rounded-full mt-1 ${
                    index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : 
                    index === 1 ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300' : 
                    'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                  }`}>
                    {index === 0 ? '1st Place' : index === 1 ? '2nd Place' : '3rd Place'}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
