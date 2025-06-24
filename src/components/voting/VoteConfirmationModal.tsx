'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { type TournamentEntry } from '@/types/tournament'

interface VoteConfirmationModalProps {
  nft: TournamentEntry
  onConfirm: () => void
  onCancel: () => void
  isVoting: boolean
}

export default function VoteConfirmationModal({
  nft,
  onConfirm,
  onCancel,
  isVoting
}: VoteConfirmationModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative max-w-md w-full bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative h-2 bg-gradient-to-r from-purple-500 to-blue-500" />

        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Confirm Your Vote</h3>
            <p className="text-gray-400">
              Once submitted, your vote cannot be changed
            </p>
          </div>

          {/* NFT Preview */}
          <div className="relative mx-auto w-48 h-48 rounded-xl overflow-hidden shadow-xl">
            <Image
              src={nft.image_url || '/images/nft-placeholder.png'}
              alt={`NFT ${nft.nft_id}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Current votes overlay */}
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-white font-bold">{nft.vote_count}</span>
              <span className="text-gray-300 text-sm ml-1">votes</span>
            </div>
          </div>

          {/* Vote Info */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-300">Your vote will be recorded on-chain</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-gray-300">One vote per wallet per tournament</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isVoting}
              className="flex-1 px-6 py-3 rounded-lg border border-gray-700 text-gray-300
                       hover:bg-gray-800 hover:text-white transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isVoting}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500
                       text-white font-bold hover:shadow-lg hover:shadow-purple-500/25
                       transform transition-all duration-200 hover:-translate-y-0.5
                       disabled:opacity-50 disabled:cursor-not-allowed
                       relative overflow-hidden group"
            >
              {/* Button shimmer effect */}
              <div className="absolute inset-0 -top-1 bg-gradient-to-b from-white/20 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {isVoting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Voting...
                </span>
              ) : (
                'Confirm Vote'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}