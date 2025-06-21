'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { NFTEntry } from '@/services/tournamentService';
import { Heart, Trophy, User, Zap } from 'lucide-react';

interface TournamentNFTGalleryProps {
  nftEntries: NFTEntry[];
  title?: string;
  showVotes?: boolean;
}

export default function TournamentNFTGallery({ 
  nftEntries, 
  title = 'Tournament Pool',
  showVotes = true
}: TournamentNFTGalleryProps) {
  // Sort entries by vote count (highest first)
  const sortedEntries = useMemo(() => {
    return [...nftEntries].sort((a, b) => b.votes - a.votes);
  }, [nftEntries]);

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
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20
      }
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { 
      icon: Trophy, 
      color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30', 
      label: '1st' 
    };
    if (index === 1) return { 
      icon: Trophy, 
      color: 'text-gray-400 bg-gray-400/10 border-gray-400/30', 
      label: '2nd' 
    };
    if (index === 2) return { 
      icon: Trophy, 
      color: 'text-orange-500 bg-orange-500/10 border-orange-500/30', 
      label: '3rd' 
    };
    return null;
  };

  return (
    <div className="bg-black border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center">
              <Zap className="w-5 h-5 mr-2 text-gray-400" />
              {title}
            </h3>
            <p className="text-sm text-gray-500">
              {sortedEntries.length === 0 
                ? 'No NFTs registered yet' 
                : `${sortedEntries.length} NFT${sortedEntries.length !== 1 ? 's' : ''} competing`}
            </p>
          </div>
          {sortedEntries.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <Heart className="w-4 h-4 mr-1" />
              {sortedEntries.reduce((total, entry) => total + entry.votes, 0)} total votes
            </div>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      {sortedEntries.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 uppercase">Tournament Pool</h3>
          <p className="text-gray-500 mb-4">No NFTs registered yet</p>
          <div className="bg-gray-900/50 border border-gray-800 p-4 max-w-md mx-auto">
            <p className="text-sm text-gray-400">
              <span className="font-medium">Ready to compete?</span> Be the first to enter your NFT and start the battle!
            </p>
          </div>
        </div>
      ) : (
        <motion.div 
          className="p-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedEntries.map((entry, index) => {
              const rankBadge = getRankBadge(index);
              
              return (
                <motion.div 
                  key={entry.nftId}
                  className="group relative bg-gray-900 overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300"
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                >
                  {/* Rank Badge */}
                  {rankBadge && (
                    <div className={`absolute top-3 left-3 z-10 flex items-center px-2 py-1 rounded-full border text-xs font-medium ${rankBadge.color}`}>
                      <rankBadge.icon className="w-3 h-3 mr-1" />
                      {rankBadge.label}
                    </div>
                  )}

                  {/* NFT Image */}
                  <div className="relative aspect-square bg-gray-800 overflow-hidden">
                    {entry.image ? (
                      <Image 
                        src={entry.image} 
                        alt={entry.name || `NFT ${entry.nftId.slice(-8)}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/nft-azur.png';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Votes Overlay */}
                    {showVotes && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-1 text-red-400" />
                            <span className="text-sm font-medium">{entry.votes.toLocaleString()}</span>
                          </div>
                          {index < 3 && (
                            <div className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                              #{index + 1}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* NFT Info */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h4 className="font-semibold text-white text-sm mb-1 truncate">
                        {entry.name || `NFT #${entry.nftId.slice(-8)}`}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="w-3 h-3 mr-1" />
                        <span className="truncate">{formatAddress(entry.owner)}</span>
                      </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                      <div className="text-xs text-gray-500">
                        Rank #{entry.rank || index + 1}
                      </div>
                      {showVotes && (
                        <div className="flex items-center text-xs font-medium text-gray-400">
                          {entry.votes} votes
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Footer Stats */}
      {sortedEntries.length > 0 && (
        <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{sortedEntries.length} participants</span>
              <span>•</span>
              <span>{sortedEntries.reduce((total, entry) => total + entry.votes, 0)} total votes</span>
            </div>
            {sortedEntries.length > 0 && (
              <div className="text-gray-400">
                Leader: {sortedEntries[0].votes} votes
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}