'use client';

import { formatRemainingTime } from '@/constants/durations';
import { SimpleTournamentService } from '@/services/simpleTournamentService';
import { useWallet } from '@/hooks/useWallet';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface SimpleTournament {
  id: string;
  name: string;
  description: string;
  banner_url: string;
  end_time: string;
  entries: any[];
  prize_pool: string;
  ended: boolean;
}

interface ModernTournamentCardProps {
  tournament: SimpleTournament;
  onEnter: (tournament: SimpleTournament) => void;
  onTournamentEnd?: () => void;
}

export default function ModernTournamentCard({ tournament, onEnter, onTournamentEnd }: ModernTournamentCardProps) {
  const [isEnding, setIsEnding] = useState(false);
  const { executeTransaction } = useWallet();

  // Calculate time remaining based on tournament end time
  const getTimeRemaining = () => {
    return formatRemainingTime(parseInt(tournament.end_time));
  };

  // Get tournament status
  const status = SimpleTournamentService.getTournamentStatus(tournament);
  const canEnd = SimpleTournamentService.canEndTournament(tournament);
  
  const statusColor = status === 'active' ? 'bg-green-400' : (status === 'ended' ? 'bg-gray-500' : 'bg-orange-400');
  const statusText = status === 'active' ? 'Active' : (status === 'ended' ? 'Ended' : 'Expired');

  const handleEndTournament = async () => {
    setIsEnding(true);
    try {
      const tx = SimpleTournamentService.createEndTournamentTransaction(tournament.id);
      const result = await executeTransaction(tx);
      
      if (result?.effects?.status?.status === 'success') {
        toast.success('Tournament ended successfully! Prizes distributed to winners.');
        onTournamentEnd?.();
      } else {
        toast.error('Failed to end tournament');
      }
    } catch (error) {
      console.error('Error ending tournament:', error);
      toast.error('Failed to end tournament');
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div className="bg-[#181A20] rounded-xl p-6 shadow-lg flex flex-col min-w-[300px] max-w-[350px] w-full">
      <div className="relative h-40 w-full mb-6 rounded-lg overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-75 blur-xl transition-all duration-500 -z-10 scale-110"></div>
        <Image
          src={tournament.banner_url || '/images/tournament-banner-default.jpg'}
          alt={tournament.name}
          fill
          className="object-cover w-full h-full transition-all duration-300 group-hover:brightness-125 group-hover:scale-105"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => { (e.target as HTMLImageElement).src = '/images/tournament-banner-default.jpg'; }}
        />
        <div className="absolute inset-0 rounded-lg shadow-[0_0_30px_rgba(59,130,246,0)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-500"></div>
        <span className="absolute top-3 right-3 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
          <span className="text-xs text-white opacity-80 font-medium capitalize">{statusText}</span>
        </span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-white text-lg truncate max-w-[70%]">{tournament.name}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span>Prize: <span className="text-blue-400 font-bold">{tournament.prize_pool ? (Number(tournament.prize_pool) / 1000000000).toFixed(2) : '0.00'} SUI</span></span>
        <span>Entry: <span className="text-green-400 font-bold">0.01 SUI</span></span>
      </div>
      <div className="text-xs text-gray-500 mb-4">
        {status === 'ended' ? 'Tournament ended' : `Time left: ${getTimeRemaining()}`}
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-2">
        <Link 
          href={`/tournaments/${tournament.id}`}
          className="w-full block text-center border border-gray-500 text-gray-400 rounded-lg py-2 font-medium hover:bg-gray-900 transition"
        >
          View Details ({tournament.entries?.length || 0} entries)
        </Link>
        
        {/* Show different buttons based on tournament status */}
        {status === 'active' && (
          <button
            className="w-full border border-blue-500 text-blue-400 rounded-lg py-2 font-medium hover:bg-blue-900 transition"
            onClick={() => onEnter(tournament)}
          >
            Enter Rivals Tournament
          </button>
        )}
        
        {status === 'expired' && canEnd && (
          <button
            className="w-full border border-orange-500 text-orange-400 rounded-lg py-2 font-medium hover:bg-orange-900 transition disabled:opacity-50"
            onClick={handleEndTournament}
            disabled={isEnding}
          >
            {isEnding ? 'Ending Tournament...' : 'End Tournament & Distribute Prizes'}
          </button>
        )}
        
        {status === 'ended' && (
          <div className="w-full text-center text-gray-400 py-2 border border-gray-600 rounded-lg">
            Tournament Complete
          </div>
        )}
      </div>
    </div>
  );
}
