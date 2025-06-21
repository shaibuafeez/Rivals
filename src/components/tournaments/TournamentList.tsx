'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SimpleTournamentService, SimpleTournament } from '@/services/simpleTournamentService';

// Adapter to make SimpleTournament compatible with existing UI  
interface Tournament extends SimpleTournament {
  status: number;
  totalParticipants: number;
  featuredImage?: string;
  startTime: number;
}
import { SuiClient } from '@mysten/sui/client';

// Simple UI components
const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
  // Define fallback image URL
  // const primaryImageUrl = 'https://i.ibb.co/mrT8jYZ/telegram-cloud-photo-size-1-5037512497065733524-y.jpg';
  const fallbackImageUrl = 'https://i.ibb.co/d4btVgJ/telegram-cloud-photo-size-1-5037512497065733523-y.jpg';
  
  // Use state to track if we should use fallback
  const [useImages, setUseImages] = useState({
    banner: tournament.bannerUrl || fallbackImageUrl,
    shouldUseFallback: false
  });
  
  // Use state for time calculations to avoid hydration mismatch
  const [timeDisplay, setTimeDisplay] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  });
  
  // Calculate time remaining on client-side only
  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const timeRemaining = tournament.endTime - now;
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeDisplay({ days, hours, minutes });
    };
    
    // Calculate immediately and then set up interval
    calculateTime();
    const interval = setInterval(calculateTime, 60000); // Update every minute
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, [tournament.endTime]);
  
  // Simple tournaments have fixed 0.01 SUI entry fee
  const entryFeeSui = 0.01;
  
  // Simple tournament status - just active/ended
  const getStatusBadge = () => {
    const isActive = Date.now() < tournament.endTime && !tournament.ended;
    if (isActive) {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Active</span>;
    } else {
      return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">Ended</span>;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group">
      <div className="relative h-48 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-60 blur-xl transition-all duration-500 -z-10 scale-110"></div>
        <Image 
          src={useImages.shouldUseFallback ? fallbackImageUrl : (tournament.bannerUrl || fallbackImageUrl)}
          alt={tournament.name}
          fill
          style={{ objectFit: 'cover' }}
          className="transition-all duration-300 group-hover:brightness-125 group-hover:scale-105 relative z-10"
          onError={() => {
            // Switch to fallback image on error
            if (!useImages.shouldUseFallback) {
              setUseImages(prev => ({ ...prev, shouldUseFallback: true }));
            }
          }}
        />
        <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(59,130,246,0)] group-hover:shadow-[inset_0_0_50px_rgba(59,130,246,0.4)] transition-all duration-500 z-20"></div>
        <div className="absolute top-2 right-2">
          {getStatusBadge()}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">{tournament.name}</h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 h-10">
          {tournament.description}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {entryFeeSui} SUI
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              entry fee
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {tournament.entriesCount}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              entries
            </span>
          </div>
        </div>
        
        {/* Prize Pool Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-md p-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Prize Pool</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {tournament.prizePool ? (Number(tournament.prizePool) / 1000000000).toFixed(2) : '0.00'} SUI
            </span>
          </div>
        </div>
        
        {!tournament.ended && Date.now() < tournament.endTime && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-2 mb-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Tournament ends in:
            </div>
            <div className="flex justify-between">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{timeDisplay.days}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">days</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{timeDisplay.hours}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">hours</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{timeDisplay.minutes}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">mins</div>
              </div>
            </div>
          </div>
        )}
        
        <Link
          href={`/tournaments/${tournament.id}`}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
        >
          {Date.now() < tournament.endTime && !tournament.ended ? 'Enter & Vote' : 'View Results'}
        </Link>
      </div>
    </div>
  );
};

const TournamentList = () => {
  // We only use activeTournaments in the component, so we don't need a separate tournaments state
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      
      // Create SuiClient with mainnet URL
      const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL! });
      const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID!;
      
      // Initialize simple tournament service
      const service = new SimpleTournamentService(suiClient, PACKAGE_ID);
      
      // Query for TournamentCreated events to find tournaments
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::simple_tournament::TournamentCreated`
        },
        limit: 50,
        order: 'descending'
      });
      
      console.log(`Found ${events.data.length} tournament events`);
      
      // Fetch details for each tournament
      const tournamentPromises = events.data
        .filter(event => (event.parsedJson as any)?.tournament_id)
        .map(async (event) => {
          const tournamentId = (event.parsedJson as any).tournament_id;
          try {
            const tournament = await service.getTournament(tournamentId);
            return tournament;
          } catch (error) {
            console.error(`Error fetching tournament ${tournamentId}:`, error);
            return null;
          }
        });
      
      const tournamentData = await Promise.all(tournamentPromises);
      const validTournaments = tournamentData.filter(t => t !== null);
      
      // Convert SimpleTournament to Tournament for UI compatibility
      const adaptedTournaments: Tournament[] = validTournaments.map(t => ({
        ...t,
        status: (Date.now() < t.endTime && !t.ended) ? 1 : 2, // 1: Active, 2: Ended
        totalParticipants: t.entriesCount,
        featuredImage: t.bannerUrl,
        startTime: Date.now() - (72 * 60 * 60 * 1000) // Assume tournaments start 72h ago
      }));
      
      setTournaments(adaptedTournaments);
      console.log(`Loaded ${adaptedTournaments.length} tournaments`);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError('Failed to fetch tournaments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  // Function to manually refresh tournaments
  const refreshTournaments = () => {
    fetchTournaments();
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Tournaments</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3 animate-pulse"></div>
                  <div className="flex justify-between mb-4">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                  </div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Tournaments</h2>
            <button 
              onClick={refreshTournaments}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          </div>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Unable to load tournaments. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (tournaments.length === 0) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Tournaments</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {lastRefreshed.toLocaleTimeString()}
              </span>
              <button 
                onClick={refreshTournaments}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No active tournaments</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">There are no active tournaments at the moment.</p>
            <div className="mt-6">
              <Link 
                href="/create-tournament"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Tournament
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show tournaments
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Tournaments</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {tournaments.length} tournaments
            </span>
            <button 
              onClick={refreshTournaments}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <Link 
              href="/create-tournament"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Tournament
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tournaments.map(tournament => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentList;
