'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useWallet } from '@suiet/wallet-kit';
import toast from 'react-hot-toast';
import { SuiClient } from '@mysten/sui/client';
import { TournamentService, NFTEntry } from '@/services/tournamentService';

interface NFTVotingGridProps {
  tournamentId: string;
  nftEntries: NFTEntry[];
  suiClient: SuiClient; // Using the proper SuiClient type
}

export default function NFTVotingGrid({ 
  tournamentId, 
  nftEntries,
  suiClient
}: NFTVotingGridProps) {
  const { connected, account } = useWallet();
  const [entries, setEntries] = useState<NFTEntry[]>([]);
  const [votingStatus, setVotingStatus] = useState<Record<string, 'idle' | 'loading' | 'voted' | 'error'>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize the tournament service with useMemo to avoid recreating on every render
  const tournamentService = useMemo(() => new TournamentService(suiClient), [suiClient]);

  useEffect(() => {
    const initializeEntries = async () => {
      setIsLoading(true);
      try {
        // If nftEntries are provided, use them
        if (nftEntries && nftEntries.length > 0) {
          setEntries(nftEntries);
          
          // Check voting status for each NFT
          const statusMap: Record<string, 'idle' | 'loading' | 'voted' | 'error'> = {};
          
          for (const entry of nftEntries) {
            const hasVoted = account ? await tournamentService.hasUserVotedForNFT(tournamentId, entry.nftId, account.address) : false;
            statusMap[entry.nftId] = hasVoted ? 'voted' : 'idle';
          }
          
          setVotingStatus(statusMap);
        } else {
          // Otherwise fetch from the tournament service
          const fetchedEntries = await tournamentService.getTournamentEntries(tournamentId);
          setEntries(fetchedEntries);
          
          // Check voting status for each NFT
          const statusMap: Record<string, 'idle' | 'loading' | 'voted' | 'error'> = {};
          
          for (const entry of fetchedEntries) {
            const hasVoted = account ? await tournamentService.hasUserVotedForNFT(tournamentId, entry.nftId, account.address) : false;
            statusMap[entry.nftId] = hasVoted ? 'voted' : 'idle';
          }
          
          setVotingStatus(statusMap);
        }
      } catch (error) {
        console.error('Error initializing NFT entries:', error);
        toast.error('Failed to load NFT entries');
      } finally {
        setIsLoading(false);
      }
    };

    if (tournamentId) {
      initializeEntries();
    }
  }, [tournamentId, nftEntries, tournamentService, account]);

  const handleVote = async (nftId: string) => {
    if (!connected || !account) {
      toast.error('Please connect your wallet to vote');
      return;
    }
    
    // Update status to loading
    setVotingStatus(prev => ({ ...prev, [nftId]: 'loading' }));
    
    try {
      // Call the tournament service to vote
      await tournamentService.voteForNFT(tournamentId, nftId, account.address);
      
      // Update status to voted
      setVotingStatus(prev => ({ ...prev, [nftId]: 'voted' }));
      
      // Show success message
      toast.success('Vote submitted successfully!');
      
      // Update the entry vote count
      setEntries(prev => 
        prev.map(entry => 
          entry.nftId === nftId 
            ? { ...entry, votes: entry.votes + 1 } 
            : entry
        )
      );
    } catch (error) {
      console.error('Error voting for NFT:', error);
      setVotingStatus(prev => ({ ...prev, [nftId]: 'error' }));
      
      // Show error message
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to submit vote');
      }
    }
  };

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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold mb-6">NFT Entries</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-square mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-xl font-bold mb-6">NFT Entries</h3>
      
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No NFT entries yet. Be the first to enter!</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {entries.map((entry) => (
            <motion.div 
              key={entry.nftId}
              className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              variants={itemVariants}
            >
              <div className="relative aspect-square bg-gray-50">
                {entry.image ? (
                  <Image 
                    src={entry.image} 
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
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Rank badge */}
                {entry.rank && (
                  <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                      entry.rank === 2 ? 'bg-gray-100 text-gray-700' : 
                        entry.rank === 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500'}`}
                  >
                    {entry.rank}
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 truncate">NFT #{entry.nftId.slice(-4)}</h4>
                    <p className="text-xs text-gray-500 truncate">{`Owner: ${entry.owner.slice(0, 6)}...${entry.owner.slice(-4)}`}</p>
                  </div>
                  <div className="text-sm font-semibold">{entry.votes} votes</div>
                </div>
                
                <button
                  onClick={() => handleVote(entry.nftId)}
                  disabled={!connected || votingStatus[entry.nftId] === 'loading' || votingStatus[entry.nftId] === 'voted'}
                  className={`w-full py-2 rounded text-sm font-medium transition-colors ${
                    !connected 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : votingStatus[entry.nftId] === 'voted'
                        ? 'bg-green-50 text-green-600 cursor-default'
                        : votingStatus[entry.nftId] === 'loading'
                          ? 'bg-blue-50 text-blue-600 cursor-wait'
                          : votingStatus[entry.nftId] === 'error'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {!connected 
                    ? 'Connect Wallet' 
                    : votingStatus[entry.nftId] === 'voted'
                      ? 'Voted ✓'
                      : votingStatus[entry.nftId] === 'loading'
                        ? 'Voting...'
                        : votingStatus[entry.nftId] === 'error'
                          ? 'Try Again'
                          : 'Vote'}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
