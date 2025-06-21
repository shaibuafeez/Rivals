'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Tournament } from '@/services/tournamentService';

interface TournamentCardProps {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  // Format the prize pool with commas
  const formattedPrizePool = tournament.prizePool 
    ? parseFloat(tournament.prizePool).toLocaleString() 
    : '0';
  
  // Calculate time remaining in a human-readable format
  const getTimeRemaining = () => {
    if (!tournament.timeRemaining) return 'N/A';
    
    const days = Math.floor(tournament.timeRemaining / (24 * 60 * 60));
    const hours = Math.floor((tournament.timeRemaining % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      const minutes = Math.floor((tournament.timeRemaining % (60 * 60)) / 60);
      return `${hours}h ${minutes}m remaining`;
    }
  };
  
  // Get status badge color and text
  const getStatusBadge = () => {
    switch (tournament.status) {
      case 0: // Registration
        return {
          text: 'Registration Open',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
      case 1: // Active
        return {
          text: 'Active',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 2: // Ended
        return {
          text: 'Ended',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
      default:
        return {
          text: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };
  
  // Get tournament type label
  const getTournamentType = () => {
    switch (tournament.tournamentType) {
      case 1:
        return 'Daily';
      case 2:
        return 'Weekly';
      case 3:
        return 'Monthly';
      default:
        return 'Custom';
    }
  };
  
  const statusBadge = getStatusBadge();
  
  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100 h-full flex flex-col">
        {/* Tournament image */}
        <div className="relative h-48 w-full bg-gray-200">
          {tournament.featuredImage ? (
            <div className="absolute inset-0">
              <Image 
                src={tournament.featuredImage} 
                alt={tournament.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
          )}
          
          {/* Status badge */}
          <div className="absolute top-4 left-4">
            <span className={`${statusBadge.bgColor} ${statusBadge.textColor} text-xs font-medium px-2.5 py-1 rounded-full`}>
              {statusBadge.text}
            </span>
          </div>
          
          {/* Tournament type badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {getTournamentType()}
            </span>
          </div>
        </div>
        
        {/* Tournament details */}
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {tournament.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {tournament.description}
          </p>
          
          <div className="mt-auto space-y-3">
            {/* Prize pool */}
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500 mr-2">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-700">
                <span className="font-semibold">{formattedPrizePool}</span> SUI Prize Pool
              </span>
            </div>
            
            {/* Participants */}
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500 mr-2">
                <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
              </svg>
              <span className="text-sm text-gray-700">
                <span className="font-semibold">{tournament.totalParticipants}</span> Participants
              </span>
            </div>
            
            {/* Time remaining */}
            {tournament.status !== 2 && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-purple-500 mr-2">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">
                  {getTimeRemaining()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Call to action */}
        <div className="px-5 pb-5">
          <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            {tournament.status === 0 ? 'Register NFT' : 
             tournament.status === 1 ? 'View & Vote' : 
             'View Results'}
          </button>
        </div>
      </div>
    </Link>
  );
}
