'use client';

import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  votes: number;
  imageUrl: string;
  rank: number;
  previousRank?: number;
}

interface LeaderboardAnimationProps {
  entries: LeaderboardEntry[];
}

export default function LeaderboardAnimation({ entries }: LeaderboardAnimationProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5" style={{ color: 'var(--accent-gold)' }} />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5" style={{ color: '#CD7F32' }} />;
      default:
        return null;
    }
  };

  const getRankChange = (current: number, previous?: number) => {
    if (!previous || current === previous) return null;
    const change = previous - current;
    if (change > 0) {
      return (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1 text-green-500 text-xs"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          +{change}
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1 text-red-500 text-xs"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {change}
        </motion.div>
      );
    }
  };

  return (
    <div className="space-y-3">
      {entries.slice(0, 3).map((entry, index) => (
        <motion.div
          key={entry.id}
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: index * 0.1,
            layout: { type: "spring", stiffness: 300, damping: 30 }
          }}
          className={`relative bg-black border p-4 transition-all duration-300 ${
            entry.rank === 1 
              ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
              : 'border-gray-800 hover:border-gray-700'
          }`}
        >
          {/* Rank Badge */}
          <div className="absolute -top-3 -left-3 z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: index * 0.1 + 0.2
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                entry.rank === 1 
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                  : entry.rank === 2
                  ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                  : 'bg-gradient-to-br from-orange-600 to-orange-800'
              }`}
            >
              <span className="text-black font-bold text-lg">{entry.rank}</span>
            </motion.div>
          </div>

          <div className="flex items-center gap-4 ml-6">
            {/* NFT Image */}
            <div className="relative w-16 h-16 overflow-hidden border border-gray-800">
              <img 
                src={entry.imageUrl} 
                alt={entry.name}
                className="w-full h-full object-cover"
              />
              {entry.rank <= 3 && (
                <div className="absolute top-1 right-1">
                  {getRankIcon(entry.rank)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h4 className="font-bold text-white uppercase tracking-wider text-sm">
                {entry.name}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold font-mono" style={{
                  color: entry.rank === 1 ? 'var(--accent-gold)' : 'white'
                }}>
                  {entry.votes}
                </span>
                <span className="text-xs text-gray-400 uppercase">votes</span>
                {getRankChange(entry.rank, entry.previousRank)}
              </div>
            </div>

            {/* Vote Progress Bar */}
            <div className="w-24">
              <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(entry.votes / entries[0]?.votes || 1) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 + 0.3 }}
                  className={`h-full ${
                    entry.rank === 1 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                      : 'bg-gray-600'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Winner Glow Effect */}
          {entry.rank === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent pointer-events-none"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}