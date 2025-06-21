'use client';

import { motion } from 'framer-motion';
import { Clock, Zap, CheckCircle, Circle } from 'lucide-react';
import { BracketMatch } from './TournamentBracket';

interface MatchScheduleProps {
  matches: BracketMatch[];
  currentRound: number;
  onMatchSelect?: (match: BracketMatch) => void;
}

export default function MatchSchedule({ 
  matches, 
  currentRound,
  onMatchSelect 
}: MatchScheduleProps) {
  
  const upcomingMatches = matches.filter(m => m.status === 'upcoming' && m.round === currentRound);
  const activeMatches = matches.filter(m => m.status === 'active');
  const completedMatches = matches.filter(m => m.status === 'completed' && m.round === currentRound);

  return (
    <div className="space-y-6">
      {/* Active Matches */}
      {activeMatches.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Live Battles
          </h3>
          <div className="space-y-2">
            {activeMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onMatchSelect?.(match)}
                className="bg-green-500/10 border border-green-500/30 p-3 cursor-pointer hover:bg-green-500/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-500 uppercase tracking-wider mb-1">
                      Round {match.round} - Match {match.matchNumber}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white font-bold truncate max-w-[100px]">
                        {match.nft1?.name || 'TBD'}
                      </span>
                      <span className="text-gray-400">vs</span>
                      <span className="text-white font-bold truncate max-w-[100px]">
                        {match.nft2?.name || 'TBD'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-500">LIVE</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Upcoming Battles
          </h3>
          <div className="space-y-2">
            {upcomingMatches.slice(0, 5).map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 border border-gray-800 p-3 hover:border-gray-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      Round {match.round} - Match {match.matchNumber}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-300 truncate max-w-[100px]">
                        {match.nft1?.name || 'Winner of Match ' + (match.matchNumber - 1)}
                      </span>
                      <span className="text-gray-500">vs</span>
                      <span className="text-gray-300 truncate max-w-[100px]">
                        {match.nft2?.name || 'Winner of Match ' + match.matchNumber}
                      </span>
                    </div>
                  </div>
                  <Circle className="w-4 h-4 text-gray-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Matches */}
      {completedMatches.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-gray-500" />
            Completed Battles
          </h3>
          <div className="space-y-2">
            {completedMatches.slice(0, 3).map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/30 border border-gray-800 p-3 opacity-60"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Round {match.round} - Match {match.matchNumber}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`truncate max-w-[100px] ${
                        match.winner === match.nft1?.id ? 'text-green-500 font-bold' : 'text-gray-500 line-through'
                      }`}>
                        {match.nft1?.name}
                      </span>
                      <span className="text-gray-600">vs</span>
                      <span className={`truncate max-w-[100px] ${
                        match.winner === match.nft2?.id ? 'text-green-500 font-bold' : 'text-gray-500 line-through'
                      }`}>
                        {match.nft2?.name}
                      </span>
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Round Progress */}
      <div className="mt-6 p-4 bg-gray-900/50 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400 uppercase tracking-wider">Round Progress</span>
          <span className="text-sm font-bold text-white">
            {completedMatches.length} / {matches.filter(m => m.round === currentRound).length}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: `${(completedMatches.length / matches.filter(m => m.round === currentRound).length) * 100}%` 
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      </div>
    </div>
  );
}