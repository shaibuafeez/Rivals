'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NFTVoteCard from './NFTVoteCard'
import VoteConfirmationModal from './VoteConfirmationModal'
import { type TournamentEntry } from '@/types/tournament'

interface NFTVotingGalleryProps {
  entries: TournamentEntry[]
  onVote: (nftId: string) => Promise<void>
  hasVoted: boolean
  votedNftId?: string
  tournamentId: string
  isVoting?: boolean
}

type SortOption = 'votes' | 'newest' | 'random'
type FilterOption = 'all' | 'top10' | 'bottom10'

export default function NFTVotingGallery({
  entries,
  onVote,
  hasVoted,
  votedNftId,
  tournamentId,
  isVoting = false
}: NFTVotingGalleryProps) {
  const [sortBy, setSortBy] = useState<SortOption>('votes')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [selectedNft, setSelectedNft] = useState<TournamentEntry | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Deduplicate entries by NFT ID and combine vote counts
  const deduplicatedEntries = useMemo(() => {
    const entryMap = new Map<string, TournamentEntry>()
    
    entries.forEach(entry => {
      const existing = entryMap.get(entry.nft_id)
      if (existing) {
        // Combine vote counts for duplicate entries
        entryMap.set(entry.nft_id, {
          ...existing,
          vote_count: existing.vote_count + entry.vote_count
        })
      } else {
        entryMap.set(entry.nft_id, entry)
      }
    })
    
    return Array.from(entryMap.values())
  }, [entries])

  // Sort and filter entries
  const processedEntries = useMemo(() => {
    let processed = [...deduplicatedEntries]

    // Apply sorting
    switch (sortBy) {
      case 'votes':
        processed.sort((a, b) => b.vote_count - a.vote_count)
        break
      case 'newest':
        processed.reverse() // Assuming newest are at the end
        break
      case 'random':
        processed.sort(() => Math.random() - 0.5)
        break
    }

    // Apply filtering
    switch (filterBy) {
      case 'top10':
        processed = processed.slice(0, 10)
        break
      case 'bottom10':
        processed = processed.slice(-10).reverse()
        break
    }

    return processed
  }, [deduplicatedEntries, sortBy, filterBy])

  const handleVoteClick = (entry: TournamentEntry) => {
    if (hasVoted || isVoting) return
    setSelectedNft(entry)
    setShowConfirmation(true)
  }

  const handleConfirmVote = async () => {
    if (!selectedNft) return
    
    try {
      await onVote(selectedNft.nft_id)
      setShowConfirmation(false)
      setSelectedNft(null)
    } catch (error) {
      console.error('Vote failed:', error)
    }
  }

  const totalVotes = deduplicatedEntries.reduce((sum, entry) => sum + entry.vote_count, 0)

  return (
    <div className="w-full space-y-6">
      {/* Header with stats and controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Vote for Your Favorite</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {totalVotes} votes cast • {deduplicatedEntries.length} NFTs competing
          </p>
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-gray-900 text-white px-3 sm:px-4 py-2 pr-8 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 w-full text-sm"
            >
              <option value="votes">Most Votes</option>
              <option value="newest">Newest First</option>
              <option value="random">Random</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="appearance-none bg-gray-900 text-white px-3 sm:px-4 py-2 pr-8 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 w-full text-sm"
            >
              <option value="all">All NFTs</option>
              <option value="top10">Top 10</option>
              <option value="bottom10">Bottom 10</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Status Banner */}
      {hasVoted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-500 font-medium">
              You've voted in this tournament
            </p>
          </div>
        </motion.div>
      )}

      {/* NFT Grid */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        layout
      >
        <AnimatePresence mode="popLayout">
          {processedEntries.map((entry, index) => (
            <motion.div
              key={entry.nft_id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <NFTVoteCard
                entry={entry}
                rank={index + 1}
                totalEntries={entries.length}
                onVote={() => handleVoteClick(entry)}
                hasVoted={hasVoted}
                isVoted={votedNftId === entry.nft_id}
                isVoting={isVoting}
                totalVotes={totalVotes}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Vote Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && selectedNft && (
          <VoteConfirmationModal
            nft={selectedNft}
            onConfirm={handleConfirmVote}
            onCancel={() => {
              setShowConfirmation(false)
              setSelectedNft(null)
            }}
            isVoting={isVoting}
          />
        )}
      </AnimatePresence>
    </div>
  )
}