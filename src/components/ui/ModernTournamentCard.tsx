'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tournament } from '@/services/tournamentService';
import Image from 'next/image';
import Link from 'next/link';

interface ModernTournamentCardProps {
  tournament: Tournament;
  onEnter: (tournament: Tournament) => void;
}

export default function ModernTournamentCard({ tournament, onEnter }: ModernTournamentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  // Calculate time remaining based on tournament end time
  const getTimeRemaining = () => {
    const now = Date.now();
    const diff = tournament.endTime - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };
  
  // Get tournament status text
  const getStatusText = () => {
    switch (tournament.status) {
      case 0: return 'Registration Open';
      case 1: return 'Active';
      case 2: return 'Ended';
      default: return 'Unknown';
    }
  };
  
  // Get badge color based on tournament type and entry fee
  const getBadgeColor = () => {
    const fee = parseFloat(tournament.entryFee);
    if (fee === 0) return 'bg-green-600';
    if (fee < 0.1) return 'bg-blue-600';
    return 'bg-purple-600';
  };
  
  // Get tournament type text
  const getTournamentType = () => {
    switch (tournament.tournamentType) {
      case 1: return 'Daily';
      case 2: return 'Weekly';
      case 3: return 'Monthly';
      default: return '';
    }
  };
  
  // Get placeholder image based on tournament name
  const getPlaceholderImage = () => {
    // Extract first letter of each word in tournament name
    const initials = tournament.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2);
    
    return initials;
  };

  // Get prize pool color
  const getPrizePoolColor = () => {
    const prize = parseFloat(tournament.prizePool || '0');
    if (prize >= 100) return 'text-purple-600';
    if (prize >= 50) return 'text-indigo-600';
    if (prize >= 10) return 'text-blue-600';
    return 'text-green-600';
  };
  
  // Calculate progress percentage for participants
  const getParticipantProgress = () => {
    // Use minParticipants as a reference point if available
    if (!tournament.minParticipants || tournament.minParticipants <= 0) return 50; // Default to 50% if no min
    const targetParticipants = tournament.minParticipants * 2; // Use 2x min as target
    const progress = (tournament.totalParticipants / targetParticipants) * 100;
    return Math.min(progress, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Header with Gradient Background */}
      <Link href={`/tournaments/${tournament.id}`} className="block">
        <div className="relative h-48 w-full bg-gradient-to-r from-gray-800 to-black overflow-hidden">
          {/* Tournament image or placeholder */}
          <div className="absolute inset-0">
            <Image 
              src={tournament.bannerImage || `/images/tournament-bg-${(tournament.tournamentType % 3) + 1}.jpg`}
              alt={tournament.name}
              fill
              className={`object-cover transition-all duration-700 ${isHovered ? 'scale-110 opacity-60' : 'opacity-40'}`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-opacity-70 text-6xl font-bold">{getPlaceholderImage()}</div>
            </div>
          </div>
        
          {/* Collection Icons (if any) */}
          {tournament.allowedCollections && tournament.allowedCollections.length > 0 && (
            <div className="absolute top-4 left-4 flex space-x-1">
              {tournament.allowedCollections.map((collection, index) => (
                <div 
                  key={collection} 
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-800 shadow-md"
                  style={{ transform: `translateX(-${index * 4}px)` }}
                >
                  {collection.substring(2, 4)}
                </div>
              ))}
              <div className="ml-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                Collection Battle
              </div>
            </div>
          )}
        
          {/* Entry Fee Badge */}
          <div className="absolute top-4 right-4">
            <div className={`${getBadgeColor()} text-white text-xs px-3 py-1 rounded-full font-medium shadow-md`}>
              {parseFloat(tournament.entryFee) === 0 ? 'FREE ENTRY' : `${tournament.entryFee} SUI`}
            </div>
          </div>
          
          {/* Tournament Type */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full shadow-md">
            {getTournamentType()}
          </div>
          
          {/* Status */}
          <motion.div 
            className={`absolute bottom-4 left-4 ${tournament.status === 1 ? 'bg-green-500' : tournament.status === 0 ? 'bg-blue-500' : 'bg-gray-500'} text-white text-xs px-3 py-1 rounded-full font-medium shadow-md`}
            animate={{ scale: tournament.status === 1 ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: tournament.status === 1 ? Infinity : 0, duration: 2 }}
          >
            {getStatusText()}
          </motion.div>
        </div>
      </Link>
      
      {/* Card Content */}
      <div className="p-5">
        <Link href={`/tournaments/${tournament.id}`} className="block">
          <div className="mb-4">
            <h3 className="font-bold text-lg text-gray-900 mb-1 hover:text-blue-600 transition-colors">{tournament.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {tournament.description}
            </p>
          </div>
        </Link>
        
        {/* Prize Pool */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <div className="text-xs text-gray-500">Prize Pool</div>
            <div className={`font-bold ${getPrizePoolColor()}`}>{tournament.prizePool} SUI</div>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: `${Math.min(parseFloat(tournament.prizePool || '0') / 2, 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="text-xs text-gray-500">Time Remaining</div>
              <div className="text-xs font-medium text-gray-700">{getTimeRemaining()}</div>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"
                style={{ 
                  width: `${Math.max(100 - ((tournament.endTime - Date.now()) / (tournament.endTime - tournament.startTime) * 100), 0)}%` 
                }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="text-xs text-gray-500">Participants</div>
              <div className="text-xs font-medium text-gray-700">
                {tournament.totalParticipants}{tournament.minParticipants ? ` (min: ${tournament.minParticipants})` : ''}
              </div>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                style={{ width: `${getParticipantProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Requirements */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tournament.isTokenGated && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-2 py-1 text-xs text-yellow-700 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Token Gated
            </div>
          )}
          
          {tournament.allowedCollections && tournament.allowedCollections.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1 text-xs text-indigo-700 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Collection Specific
            </div>
          )}
          
          {parseFloat(tournament.entryFee) > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-lg px-2 py-1 text-xs text-green-700 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Entry Fee: {tournament.entryFee} SUI
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link 
            href={`/tournaments/${tournament.id}`}
            className="flex-1 bg-gray-100 text-gray-800 font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Details
          </Link>
          
          <button 
            onClick={() => onEnter(tournament)}
            className="flex-[2] bg-black text-white font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Enter Tournament
          </button>
        </div>
      </div>
    </motion.div>
  );
}
