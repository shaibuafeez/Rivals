'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { useSuiClient } from '@mysten/dapp-kit';
import { castToSuiClient } from '@/types/sui-client';
import { TournamentService, Tournament } from '@/services/tournamentService';
import NFTSelectionModal from '@/components/ui/NFTSelectionModal';
import TournamentLeaderboard from '@/components/ui/TournamentLeaderboard';
import ShareTournamentEntry from '@/components/ui/ShareTournamentEntry';

export default function TournamentDetails() {
  const params = useParams();
  const tournamentId = params.id as string;
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [entryId, setEntryId] = useState('');
  
  const { isConnected } = useWallet();
  const suiClient = useSuiClient();
  const tournamentService = useMemo(() => new TournamentService(castToSuiClient(suiClient)), [suiClient]);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const tournaments = await tournamentService.getTournaments();
        const foundTournament = tournaments.find((t: Tournament) => t.id === tournamentId);
        
        if (foundTournament) {
          setTournament(foundTournament);
        }
        
        // Check if user has already entered this tournament
        const lastEnteredTournament = localStorage.getItem('lastEnteredTournament');
        if (lastEnteredTournament) {
          const parsed = JSON.parse(lastEnteredTournament);
          if (parsed.tournamentId === tournamentId) {
            setHasEntered(true);
            setEntryId(parsed.entryId);
          }
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournament();
  }, [tournamentId, tournamentService]);

  const handleEnterTournament = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    setIsNFTModalOpen(true);
  };
  
  const handleEntrySuccess = () => {
    setHasEntered(true);
    
    // Get entry ID from localStorage
    const lastEnteredTournament = localStorage.getItem('lastEnteredTournament');
    if (lastEnteredTournament) {
      const parsed = JSON.parse(lastEnteredTournament);
      setEntryId(parsed.entryId);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
              
              <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
            </div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
        <p className="text-gray-600 mb-6">The tournament you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/tournaments" className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
          Back to Tournaments
        </Link>
      </div>
    );
  }

  const formatTimeRemaining = () => {
    if (tournament.status === 2) return 'Tournament Ended';
    
    const timeRemaining = tournament.timeRemaining || 0;
    const days = Math.floor(timeRemaining / (24 * 60 * 60));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
      return `${hours}h ${minutes}m remaining`;
    }
  };

  const getTournamentType = () => {
    switch (tournament.tournamentType) {
      case 1: return 'Daily Tournament';
      case 2: return 'Weekly Tournament';
      case 3: return 'Monthly Tournament';
      default: return 'Tournament';
    }
  };

  const getStatusBadge = () => {
    switch (tournament.status) {
      case 0:
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Registration Open</span>;
      case 1:
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>;
      case 2:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Ended</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <Link href="/tournaments" className="text-gray-500 hover:text-black mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold">{tournament.name}</h1>
      </div>
      
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-10">
        <Image
          src={tournament.bannerImage || '/images/tournament-banner.jpg'}
          alt={tournament.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <div className="flex items-center mb-2">
            {getStatusBadge()}
            <span className="ml-3 text-white text-sm">{getTournamentType()}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{tournament.name}</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Tournament Details</h3>
                <p className="text-gray-600">{tournament.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Entry Fee</div>
                <div className="text-xl font-bold">{tournament.entryFee} SUI</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className="font-medium">
                  {tournament.status === 0 ? 'Registration' : 
                   tournament.status === 1 ? 'Active' : 'Ended'}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Time Remaining</div>
                <div className="font-medium">{formatTimeRemaining()}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Participants</div>
                <div className="font-medium">{tournament.totalParticipants}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Prize Pool</div>
                <div className="font-medium">{tournament.prizePool} SUI</div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">Entry Requirements</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {tournament.isTokenGated && (
                  <li>Must own a token from the required collection</li>
                )}
                <li>Must have a valid NFT to enter</li>
                <li>Entry fee: {tournament.entryFee} SUI</li>
              </ul>
            </div>
            
            {hasEntered ? (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700 font-medium">You&apos;ve entered this tournament!</p>
                </div>
                
                <ShareTournamentEntry 
                  tournamentId={tournamentId}
                  entryId={entryId}
                  tournamentName={tournament.name}
                />
              </div>
            ) : (
              <button
                onClick={handleEnterTournament}
                disabled={tournament.status === 2}
                className={`w-full py-3 rounded-lg font-medium ${
                  tournament.status === 2
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 transition-colors'
                }`}
              >
                {tournament.status === 2
                  ? 'Tournament Ended'
                  : `Enter Tournament (${tournament.entryFee} SUI)`}
              </button>
            )}
          </motion.div>
          
          {tournament.rules && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
            >
              <h3 className="text-xl font-bold mb-4">Tournament Rules</h3>
              <div className="prose prose-sm max-w-none text-gray-600">
                <p>{tournament.rules}</p>
              </div>
            </motion.div>
          )}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TournamentLeaderboard 
            tournamentId={tournamentId} 
            isEnded={tournament.status === 2}
          />
        </motion.div>
      </div>
      
      <NFTSelectionModal
        isOpen={isNFTModalOpen}
        onClose={() => setIsNFTModalOpen(false)}
        tournamentId={tournamentId}
        entryFee={tournament.entryFee}
        onSuccess={handleEntrySuccess}
      />
    </div>
  );
}
