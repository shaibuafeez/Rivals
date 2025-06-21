'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Crown, Swords, X } from 'lucide-react';

export interface BracketMatch {
  id: string;
  round: number;
  matchNumber: number;
  nft1?: {
    id: string;
    name: string;
    imageUrl: string;
    votes: number;
  };
  nft2?: {
    id: string;
    name: string;
    imageUrl: string;
    votes: number;
  };
  winner?: string;
  status: 'upcoming' | 'active' | 'completed';
  startTime?: number;
  endTime?: number;
}

interface TournamentBracketProps {
  matches: BracketMatch[];
  currentRound: number;
  totalRounds: number;
  onMatchClick?: (match: BracketMatch) => void;
}

export default function TournamentBracket({ 
  matches, 
  currentRound, 
  totalRounds,
  onMatchClick 
}: TournamentBracketProps) {
  
  const getRoundName = (round: number) => {
    const totalMatches = matches.filter(m => m.round === round).length;
    if (round === totalRounds) return 'FINALS';
    if (round === totalRounds - 1) return 'SEMI-FINALS';
    if (round === totalRounds - 2) return 'QUARTER-FINALS';
    return `ROUND ${round}`;
  };

  const getMatchesByRound = (round: number) => {
    return matches.filter(m => m.round === round);
  };

  const isNFTEliminated = (nftId: string, match: BracketMatch) => {
    return match.status === 'completed' && match.winner && match.winner !== nftId;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1200px] p-8">
        {/* Bracket Grid */}
        <div className="grid grid-cols-4 gap-8">
          {[...Array(totalRounds)].map((_, roundIndex) => {
            const round = roundIndex + 1;
            const roundMatches = getMatchesByRound(round);
            
            return (
              <div key={round} className="space-y-8">
                {/* Round Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: roundIndex * 0.1 }}
                  className="text-center"
                >
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${
                    round === currentRound ? 'text-white' : 'text-gray-400'
                  }`}>
                    {getRoundName(round)}
                  </h3>
                  {round === currentRound && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-500">ACTIVE</span>
                    </div>
                  )}
                </motion.div>

                {/* Matches */}
                <div className={`space-y-4 ${
                  round === totalRounds ? 'mt-32' : ''
                }`}>
                  {roundMatches.map((match, matchIndex) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: roundIndex * 0.1 + matchIndex * 0.05 }}
                      onClick={() => onMatchClick?.(match)}
                      className={`relative bg-black border p-4 cursor-pointer transition-all ${
                        match.status === 'active' 
                          ? 'border-green-500 shadow-lg shadow-green-500/20' 
                          : match.status === 'completed'
                          ? 'border-gray-800'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {/* Match Number */}
                      <div className="absolute -top-3 left-4 px-2 py-1 bg-black text-xs text-gray-400">
                        MATCH {match.matchNumber}
                      </div>

                      {/* NFT 1 */}
                      <div className={`mb-3 ${match.nft1 && isNFTEliminated(match.nft1.id, match) ? 'opacity-50' : ''}`}>
                        {match.nft1 ? (
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 overflow-hidden border border-gray-800">
                              <Image
                                src={match.nft1.imageUrl}
                                alt={match.nft1.name}
                                fill
                                className="object-cover"
                              />
                              {match.winner === match.nft1.id && (
                                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                  <Crown className="w-6 h-6 text-green-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-white truncate">
                                {match.nft1.name}
                              </p>
                              {match.status === 'active' && (
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(match.nft1.votes / (match.nft1.votes + (match.nft2?.votes || 0))) * 100}%` }}
                                      className="h-full bg-green-500"
                                    />
                                  </div>
                                  <span className="text-xs text-gray-400">{match.nft1.votes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-12 bg-gray-900 border border-gray-800 flex items-center justify-center">
                            <span className="text-xs text-gray-600">TBD</span>
                          </div>
                        )}
                      </div>

                      {/* VS Divider */}
                      <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-800" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-2 bg-black text-xs text-gray-400">VS</span>
                        </div>
                      </div>

                      {/* NFT 2 */}
                      <div className={`mt-3 ${match.nft2 && isNFTEliminated(match.nft2.id, match) ? 'opacity-50' : ''}`}>
                        {match.nft2 ? (
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 overflow-hidden border border-gray-800">
                              <Image
                                src={match.nft2.imageUrl}
                                alt={match.nft2.name}
                                fill
                                className="object-cover"
                              />
                              {match.winner === match.nft2.id && (
                                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                  <Crown className="w-6 h-6 text-green-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-white truncate">
                                {match.nft2.name}
                              </p>
                              {match.status === 'active' && (
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(match.nft2.votes / ((match.nft1?.votes || 0) + match.nft2.votes)) * 100}%` }}
                                      className="h-full bg-blue-500"
                                    />
                                  </div>
                                  <span className="text-xs text-gray-400">{match.nft2.votes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-12 bg-gray-900 border border-gray-800 flex items-center justify-center">
                            <span className="text-xs text-gray-600">TBD</span>
                          </div>
                        )}
                      </div>

                      {/* Match Status */}
                      {match.status === 'active' && (
                        <motion.div
                          className="absolute -right-2 top-1/2 -translate-y-1/2"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Swords className="w-6 h-6 text-green-500" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Connection Lines */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
          {/* Add connection lines between rounds */}
        </svg>
      </div>
    </div>
  );
}