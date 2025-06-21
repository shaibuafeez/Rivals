'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tournament } from '@/services/tournamentService';

interface TrendingTournamentsProps {
  tournaments: Tournament[];
}

export default function TrendingTournaments({ tournaments }: TrendingTournamentsProps) {
  const [trendingTournaments, setTrendingTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    // In a real implementation, we would have an algorithm to determine trending tournaments
    // For now, we'll just take the tournaments with the most participants
    const sortedTournaments = [...tournaments]
      .sort((a, b) => b.totalParticipants - a.totalParticipants)
      .slice(0, 3);
    
    setTrendingTournaments(sortedTournaments);
  }, [tournaments]);

  if (trendingTournaments.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Trending Tournaments</h2>
        <Link 
          href="/tournaments" 
          className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          View all
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trendingTournaments.map((tournament, index) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-xl"
          >
            <Link href={`/tournaments/${tournament.id}`}>
              <div className="relative h-48 w-full overflow-hidden rounded-xl">
                <Image
                  src={`/images/tournaments/${tournament.id}.jpg`}
                  alt={tournament.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => { (e.target as HTMLImageElement).src = '/images/tournaments/default.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full 
                        ${tournament.status === 0 ? 'bg-blue-100 text-blue-800' : 
                          tournament.status === 1 ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {tournament.status === 0 ? 'Registration' : 
                         tournament.status === 1 ? 'Active' : 'Ended'}
                      </span>
                      
                      {tournament.isTokenGated && (
                        <span className="px-2 py-1 bg-ink-100 text-ink-800 text-xs font-medium rounded-full">
                          Token Gated
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-white text-xs">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {tournament.totalParticipants}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{tournament.name}</h3>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-white/80">
                      {tournament.entryFee === '0' ? 'Free Entry' : `${tournament.entryFee} SUI`}
                    </div>
                    
                    <div className="text-sm text-white/80">
                      {tournament.tournamentType === 1 ? 'Daily' : 
                       tournament.tournamentType === 2 ? 'Weekly' : 'Monthly'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                {tournament.prizePool ? (Number(tournament.prizePool) / 1000000000).toFixed(2) : '0.00'} SUI Prize
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
