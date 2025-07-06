'use client';

import { Trophy, Medal, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Winner {
  address: string;
  rank: number;
  amount: number;
  nft_id: string;
  image_url?: string;
}

interface TournamentWinnersProps {
  tournamentId: string;
  isVisible: boolean;
}

export default function TournamentWinners({ tournamentId, isVisible }: TournamentWinnersProps) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && tournamentId) {
      // TODO: Fetch tournament events to get prize distribution data
      // For now, we'll show a placeholder
      setWinners([]);
    }
  }, [isVisible, tournamentId]);

  if (!isVisible) return null;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankText = (rank: number) => {
    switch (rank) {
      case 1:
        return '1st Place';
      case 2:
        return '2nd Place';
      case 3:
        return '3rd Place';
      default:
        return `${rank}th Place`;
    }
  };

  const formatPrize = (amount: number) => {
    return (amount / 1000000000).toFixed(3);
  };

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">
          Tournament Winners
        </h3>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading winners...</p>
        </div>
      ) : winners.length > 0 ? (
        <div className="space-y-3">
          {winners.map((winner, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700"
            >
              <div className="flex items-center gap-2">
                {getRankIcon(winner.rank)}
                <span className="text-white font-medium">
                  {getRankText(winner.rank)}
                </span>
              </div>
              
              <div className="flex-1">
                <p className="text-gray-300 text-sm truncate">
                  {winner.address.slice(0, 8)}...{winner.address.slice(-6)}
                </p>
                {winner.nft_id && (
                  <p className="text-gray-500 text-xs">
                    NFT: {winner.nft_id.slice(0, 8)}...
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-green-400 font-bold">
                  {formatPrize(winner.amount)} SUI
                </p>
                <p className="text-gray-500 text-xs">
                  {winner.rank === 1 ? '60%' : winner.rank === 2 ? '30%' : '10%'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">
            Tournament completed with insufficient participants.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Entry fees were refunded to all participants.
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
        <p className="text-blue-300 text-sm">
          <strong>Prize Distribution:</strong> 60% to 1st place, 30% to 2nd place, 10% to 3rd place
        </p>
        <p className="text-blue-400 text-xs mt-1">
          Minimum 5 participants required for prize distribution
        </p>
      </div>
    </div>
  );
}