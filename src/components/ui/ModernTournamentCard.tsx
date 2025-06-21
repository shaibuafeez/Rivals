'use client';

import { Tournament } from '@/services/tournamentService';
import Image from 'next/image';
import Link from 'next/link';

interface ModernTournamentCardProps {
  tournament: Tournament;
  onEnter: (tournament: Tournament) => void;
}

export default function ModernTournamentCard({ tournament, onEnter }: ModernTournamentCardProps) {
  // Calculate time remaining based on tournament end time
  const getTimeRemaining = () => {
    const now = Date.now();
    const diff = tournament.endTime - now;
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const status = tournament.status === 2 ? 'Ended' : (tournament.status === 1 ? 'Active' : 'Registration Open');
  const statusColor = status === 'Active' ? 'bg-green-400' : (status === 'Ended' ? 'bg-gray-500' : 'bg-blue-400');

  return (
    <div className="bg-[#181A20] rounded-xl p-6 shadow-lg flex flex-col min-w-[300px] max-w-[350px] w-full">
      <div className="relative h-40 w-full mb-6 rounded-lg overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-75 blur-xl transition-all duration-500 -z-10 scale-110"></div>
        <Image
          src={tournament.bannerImage || '/images/tournament-banner-default.jpg'}
          alt={tournament.name}
          fill
          className="object-cover w-full h-full transition-all duration-300 group-hover:brightness-125 group-hover:scale-105"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => { (e.target as HTMLImageElement).src = '/images/tournament-banner-default.jpg'; }}
        />
        <div className="absolute inset-0 rounded-lg shadow-[0_0_30px_rgba(59,130,246,0)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-500"></div>
        <span className="absolute top-3 right-3 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
          <span className="text-xs text-white opacity-80 font-medium capitalize">{status}</span>
        </span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-white text-lg truncate max-w-[70%]">{tournament.name}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span>Prize: <span className="text-blue-400 font-bold">{tournament.prizePool ? (Number(tournament.prizePool) / 1000000000).toFixed(2) : '0.00'} SUI</span></span>
        <span>Entry: {tournament.entryFee ? (Number(tournament.entryFee) / 1000000000).toFixed(2) : '0.00'} SUI</span>
      </div>
      <div className="text-xs text-gray-500 mb-4">Time left: {getTimeRemaining()}</div>
      
      {/* Action Buttons */}
      <div className="space-y-2">
        <Link 
          href={`/tournaments/${tournament.id}#tournament-pool`}
          className="w-full block text-center border border-ink-500 text-ink-400 rounded-lg py-2 font-medium hover:bg-ink-900 transition"
        >
          View Pool ({tournament.totalParticipants})
        </Link>
        <button
          className="w-full border border-blue-500 text-blue-400 rounded-lg py-2 font-medium hover:bg-blue-900 transition"
          onClick={() => onEnter(tournament)}
        >
          Enter Tournament
        </button>
      </div>
    </div>
  );
}
