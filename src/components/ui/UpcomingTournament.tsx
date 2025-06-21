'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tournament } from '@/services/tournamentService';

interface UpcomingTournamentProps {
  tournament: Tournament;
}

export default function UpcomingTournament({ tournament }: UpcomingTournamentProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Calculate time remaining until tournament starts
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const startTime = tournament.startTime;
      const difference = startTime - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [tournament.startTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-indigo-900 to-ink-900 rounded-2xl overflow-hidden shadow-xl mb-12"
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-black/30 z-10 transition-all duration-300 group-hover:bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-50 blur-2xl transition-all duration-500 scale-110"></div>
        <div className="relative h-48 md:h-64 w-full overflow-hidden">
          <Image
            src={tournament.bannerImage || '/images/tournament-banner.jpg'}
            alt={tournament.name}
            fill
            className="object-cover transition-all duration-300 group-hover:brightness-125 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(99,102,241,0)] group-hover:shadow-[inset_0_0_60px_rgba(99,102,241,0.5)] transition-all duration-500 z-10"></div>
        
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-black text-xs font-medium rounded-full">
            Coming Soon
          </span>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
              <div className="text-xs text-white/70">Days</div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{timeLeft.hours}</div>
              <div className="text-xs text-white/70">Hours</div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{timeLeft.minutes}</div>
              <div className="text-xs text-white/70">Minutes</div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{timeLeft.seconds}</div>
              <div className="text-xs text-white/70">Seconds</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-2">{tournament.name}</h2>
        <p className="text-white/80 mb-4 line-clamp-2">{tournament.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-white/70 mb-1">Entry Fee</div>
            <div className="font-medium text-white">
              {tournament.entryFee === '0' ? 'Free Entry' : `${tournament.entryFee} SUI`}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-white/70 mb-1">Prize Pool</div>
            <div className="font-medium text-white">{tournament.prizePool} SUI</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-white/70 mb-1">Type</div>
            <div className="font-medium text-white">
              {tournament.tournamentType === 1 ? 'Daily' : 
               tournament.tournamentType === 2 ? 'Weekly' : 'Monthly'}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-white/70 mb-1">Participants</div>
            <div className="font-medium text-white">{tournament.totalParticipants}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Link
            href={`/tournaments/${tournament.id}`}
            className="bg-white text-black px-6 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            View Details
          </Link>
          
          <div className="flex items-center space-x-2">
            {tournament.isTokenGated && (
              <span className="px-3 py-1 bg-ink-800 text-white text-xs font-medium rounded-full">
                Token Gated
              </span>
            )}
            {tournament.allowedCollections && tournament.allowedCollections.length > 0 && (
              <span className="px-3 py-1 bg-indigo-800 text-white text-xs font-medium rounded-full">
                Collection Battle
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
