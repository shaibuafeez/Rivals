'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { type TournamentEntry } from '@/types/tournament'

interface NFTVoteCardProps {
  entry: TournamentEntry
  rank: number
  totalEntries: number
  onVote: () => void
  hasVoted: boolean
  isVoted: boolean
  isVoting: boolean
  totalVotes: number
}

export default function NFTVoteCard({
  entry,
  rank,
  totalEntries,
  onVote,
  hasVoted,
  isVoted,
  isVoting,
  totalVotes
}: NFTVoteCardProps) {
  const votePercentage = totalVotes > 0 ? (entry.vote_count / totalVotes) * 100 : 0
  const isTopThree = rank <= 3
  const isClickable = !hasVoted && !isVoting

  // Determine rank badge color
  const getRankColor = () => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600' // Gold
      case 2: return 'from-gray-300 to-gray-500' // Silver
      case 3: return 'from-orange-400 to-orange-600' // Bronze
      default: return 'from-gray-600 to-gray-700'
    }
  }

  return (
    <motion.div
      className={`
        relative group cursor-pointer overflow-hidden rounded-2xl
        bg-black border transition-all duration-300
        ${isVoted 
          ? 'border-green-500 shadow-lg shadow-green-500/20' 
          : 'border-gray-800 hover:border-gray-700'
        }
        ${isClickable ? 'hover:-translate-y-1 hover:shadow-xl' : 'cursor-not-allowed'}
      `}
      whileHover={isClickable ? { scale: 1.02 } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
      onClick={isClickable ? onVote : undefined}
    >
      {/* Rank Badge */}
      {isTopThree && (
        <div className="absolute top-3 left-3 z-10">
          <div className={`
            w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor()}
            flex items-center justify-center font-bold text-white text-sm
            shadow-lg transform transition-transform group-hover:scale-110
          `}>
            {rank}
          </div>
        </div>
      )}

      {/* Voted Badge */}
      {isVoted && (
        <div className="absolute top-3 right-3 z-10">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        </div>
      )}

      {/* NFT Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-900">
        <Image
          src={entry.image_url || '/images/nft-placeholder.png'}
          alt={`NFT ${entry.nft_id}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        
        {/* Hover Overlay */}
        <div className={`
          absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
          flex items-end p-4
        `}>
          {isClickable && (
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              className="w-full bg-white text-black font-bold py-3 rounded-lg
                         transform transition-all duration-200 hover:bg-gray-100"
            >
              Vote
            </motion.button>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Vote Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{entry.vote_count}</span>
            <span className="text-sm text-gray-400">votes</span>
          </div>
          <span className="text-sm text-gray-500">{votePercentage.toFixed(1)}%</span>
        </div>

        {/* Vote Progress Bar */}
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${votePercentage}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Submitter Info */}
        <div className="flex items-center gap-2 text-xs">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
          <span className="text-gray-400 truncate">
            {entry.submitter.slice(0, 6)}...{entry.submitter.slice(-4)}
          </span>
        </div>
      </div>

      {/* Pulse Animation for Top 3 */}
      {isTopThree && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`
            absolute inset-0 rounded-2xl opacity-30
            ${rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-300' : 'bg-orange-400'}
            animate-pulse
          `} />
        </div>
      )}
    </motion.div>
  )
}