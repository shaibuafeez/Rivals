'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useSuiClient } from '@mysten/dapp-kit';
import { TournamentService, NFTEntry, Tournament } from '@/services/tournamentService';
import { castToSuiClient } from '@/types/sui-client';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface TournamentNFTPoolProps {
  tournamentId: string;
}

export default function TournamentNFTPool({ tournamentId }: TournamentNFTPoolProps) {
  const { address, isConnected, executeTransaction } = useWallet();
  const suiClient = useSuiClient();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [entries, setEntries] = useState<NFTEntry[]>([]);
  const [eligibleNfts, setEligibleNfts] = useState<Array<{id: string; name: string; imageUrl: string}>>([]);
  const [isEligible, setIsEligible] = useState(false);
  const [ineligibilityReason, setIneligibilityReason] = useState<string>('');
  const [votingFor, setVotingFor] = useState<string | null>(null);
  const [hasUserParticipated, setHasUserParticipated] = useState(false);
  
  // Create tournament service with useMemo to prevent recreation on each render
  const tournamentService = useMemo(() => new TournamentService(castToSuiClient(suiClient)), [suiClient]);
  
  // Load tournament data and entries
  useEffect(() => {
    const loadTournamentData = async () => {
      try {
        setLoading(true);
        
        // Get tournament details
        const tournamentDetails = await tournamentService.getTournamentById(tournamentId);
        if (tournamentDetails) {
          setTournament(tournamentDetails);
          
          // Get tournament entries
          const tournamentEntries = await tournamentService.getTournamentEntries(tournamentId);
          setEntries(tournamentEntries);
          
          // Check if user has an entry in this tournament
          if (address) {
            const userEntry = tournamentEntries.find(entry => entry.owner === address);
            setHasUserParticipated(!!userEntry);
          }
        }
      } catch (error) {
        console.error('Error loading tournament data:', error);
        toast.error('Failed to load tournament data');
      } finally {
        setLoading(false);
      }
    };
    
    loadTournamentData();
  }, [tournamentId, tournamentService, address]);
  
  // Verify if user has required NFTs when wallet is connected
  useEffect(() => {
    const verifyEligibility = async () => {
      if (!isConnected || !address) {
        setIsEligible(false);
        setIneligibilityReason('Please connect your wallet');
        return;
      }
      
      try {
        setVerifying(true);
        
        // Check if user has required NFTs
        const { eligible, reason, eligibleNfts: nfts } = await tournamentService.verifyTournamentRequirements(
          address,
          tournamentId
        );
        
        setIsEligible(eligible);
        if (!eligible && reason) {
          setIneligibilityReason(reason);
        }
        
        if (nfts) {
          setEligibleNfts(nfts);
        }
      } catch (error) {
        console.error('Error verifying eligibility:', error);
        setIsEligible(false);
        setIneligibilityReason('Error verifying eligibility');
      } finally {
        setVerifying(false);
      }
    };
    
    if (isConnected && address) {
      verifyEligibility();
    }
  }, [isConnected, address, tournamentId, tournamentService]);
  
  // Handle voting for an NFT
  const handleVote = async (nftId: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (votingFor === nftId) {
      return; // Already voting for this NFT
    }
    
    try {
      setVotingFor(nftId);
      
      // Check if user has already voted for this NFT
      const hasVoted = await tournamentService.hasUserVotedForNFT(tournamentId, nftId, address);
      if (hasVoted) {
        toast.error('You have already voted for this NFT');
        setVotingFor(null);
        return;
      }
      
      // Create the transaction
      const txPromise = tournamentService.voteForNFTTransaction(tournamentId, nftId);
      const tx = await txPromise; // Await the promise to get the actual Transaction
      
      // Execute the transaction
      const result = await executeTransaction(tx);
      
      if (result?.effects?.status?.status === 'success') {
        toast.success('Vote submitted successfully!');
        
        // Update the entry vote count
        setEntries(prev => 
          prev.map(entry => 
            entry.nftId === nftId 
              ? { ...entry, votes: entry.votes + 1 } 
              : entry
          )
        );
      } else {
        toast.error('Failed to submit vote');
      }
    } catch (error) {
      console.error('Error voting for NFT:', error);
      toast.error('Failed to vote for NFT');
    } finally {
      setVotingFor(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!tournament) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl text-gray-600">Tournament not found</h3>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Tournament NFT Pool</h2>
      
      {/* Eligibility Section */}
      {!isConnected ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-700">Please connect your wallet to check eligibility and vote</p>
        </div>
      ) : verifying ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
          <p className="text-blue-700">Verifying your eligibility...</p>
        </div>
      ) : !isEligible ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{ineligibilityReason || 'You are not eligible to participate in this tournament'}</p>
        </div>
      ) : hasUserParticipated ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700">You are participating in this tournament!</p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700">You are eligible to participate in this tournament!</p>
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Your eligible NFTs:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {eligibleNfts.map(nft => (
                <div 
                  key={nft.id} 
                  className="border border-gray-200 rounded-lg p-2 hover:border-blue-500 cursor-pointer transition-colors"
                  onClick={() => {
                    // Redirect to enter tournament page with this NFT pre-selected
                    window.location.href = `/tournaments/${tournamentId}?nft=${nft.id}`;
                  }}
                >
                  <div className="aspect-square relative rounded-md overflow-hidden mb-2">
                    <Image 
                      src={nft.imageUrl || '/images/nft-placeholder.png'} 
                      alt={nft.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium truncate">{nft.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Tournament Entries */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Current Entries ({entries.length})</h3>
        
        {entries.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No entries yet. Be the first to enter!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {entries.map(entry => (
              <div key={entry.nftId} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="aspect-video relative">
                  <Image 
                    src={entry.image || '/images/nft-placeholder.png'} 
                    alt={`NFT ${entry.nftId}`}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium truncate">{entry.name || `NFT #${entry.nftId.substring(0, 8)}`}</p>
                      <p className="text-xs text-gray-500 truncate">Owner: {entry.owner.substring(0, 8)}...</p>
                    </div>
                    <div className="bg-gray-100 px-2 py-1 rounded-full text-sm font-medium">
                      {entry.votes} votes
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleVote(entry.nftId)}
                    disabled={votingFor === entry.nftId || !isConnected}
                    className={`w-full mt-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      votingFor === entry.nftId
                        ? 'bg-gray-300 text-gray-700 cursor-wait'
                        : !isConnected
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {votingFor === entry.nftId ? 'Voting...' : 'Vote'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
