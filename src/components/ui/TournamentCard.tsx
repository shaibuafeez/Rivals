'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { Tournament } from '@/services/tournamentService';
import Image from 'next/image';

interface TournamentCardProps {
  tournament: Tournament;
  onEnter: (tournament: Tournament) => void;
}

export default function TournamentCard({ tournament, onEnter }: TournamentCardProps) {
  const { isConnected } = useWallet();
  const [showDetails, setShowDetails] = useState(false);
  
  // Format time remaining
  const getTimeRemaining = () => {
    const now = Date.now();
    const timeLeft = tournament.endTime - now;
    
    if (timeLeft <= 0) return 'Ended';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    if (hours < 24) return `${hours} hours left`;
    
    const days = Math.floor(hours / 24);
    return `${days} days left`;
  };
  
  // Check if user meets requirements
  const meetsRequirements = () => {
    // This is a placeholder - in a real implementation, we would check:
    // 1. If the user has the required NFT collection for collection-specific tournaments
    // 2. If the user has the required token for token-gated tournaments
    // These checks would be done through the SDK or smart contracts
    return true;
  };
  
  // Get status text and color
  const getStatusInfo = () => {
    if (tournament.status === 0) { // Registration
      return {
        text: 'Registration Open',
        color: 'bg-blue-100 text-blue-700'
      };
    } else if (tournament.status === 1) { // Active
      return {
        text: 'Active',
        color: 'bg-green-100 text-green-700'
      };
    } else { // Ended
      return {
        text: 'Ended',
        color: 'bg-gray-100 text-gray-700'
      };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden dark:shadow-gray-900/30"
    >
      {/* Tournament Image */}
      <div className="relative w-full h-40 mb-4 overflow-hidden rounded-t-xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-75 blur-xl transition-all duration-500 -z-10 scale-110"></div>
        <Image
          src={`/images/tournaments/${tournament.id}.jpg`}
          alt={tournament.name}
          fill
          className="object-cover w-full h-full transition-all duration-300 group-hover:brightness-125 group-hover:scale-105"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => { (e.target as HTMLImageElement).src = '/images/tournaments/default.jpg'; }}
        />
        <div className="absolute inset-0 rounded-t-xl shadow-[0_0_40px_rgba(99,102,241,0)] group-hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all duration-500"></div>
      </div>
      <div className="p-5 dark:text-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-lg dark:text-white">{tournament.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              {tournament.description}
            </p>
          </div>
          <div className="bg-black text-white text-xs px-3 py-1 rounded-full">
            {tournament.entryFee} SUI
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Participants:</span> {tournament.totalParticipants}
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {getTimeRemaining()}
          </div>
        </div>
        
        {/* Prize Pool Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-md p-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Prize Pool</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {tournament.prizePool ? (Number(tournament.prizePool) / 1000000000).toFixed(2) : '0.00'} SUI
            </span>
          </div>
        </div>
        
        {/* Tournament details toggle */}
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-3"
        >
          {showDetails ? 'Hide details' : 'Show details'}
          <svg 
            className={`w-4 h-4 ml-1 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Expanded details */}
        {showDetails && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-3 text-xs dark:text-gray-200">
            {tournament.registrationEndTime && (
              <div className="mb-1">
                <span className="font-medium">Registration ends:</span> {new Date(tournament.registrationEndTime).toLocaleString()}
              </div>
            )}
            
            {tournament.minParticipants && tournament.minParticipants > 0 && (
              <div className="mb-1">
                <span className="font-medium">Minimum participants:</span> {tournament.minParticipants}
              </div>
            )}
            
            {tournament.allowedCollections && tournament.allowedCollections.length > 0 && (
              <div className="mb-1">
                <span className="font-medium">Allowed collections:</span> {tournament.allowedCollections.map(c => c.substring(0, 8)).join(', ')}
              </div>
            )}
            
            {tournament.isTokenGated && (
              <div className="mb-1">
                <span className="font-medium">Token gated:</span> Yes
              </div>
            )}
          </div>
        )}
        
        {/* Entry requirements warning */}
        {!meetsRequirements() && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-md p-2 mb-3 text-xs text-yellow-700">
            You don&apos;t meet the requirements to enter this tournament.
          </div>
        )}
        
        <button 
          onClick={() => onEnter(tournament)}
          disabled={!isConnected || !meetsRequirements()}
          className={`w-full py-2 rounded-lg text-sm transition-colors ${
            !isConnected || !meetsRequirements()
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {!isConnected 
            ? 'Connect Wallet to Enter' 
            : !meetsRequirements() 
              ? 'Requirements Not Met' 
              : 'Enter Tournament'}
        </button>
      </div>
    </motion.div>
  );
}
