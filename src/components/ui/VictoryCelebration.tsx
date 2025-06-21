'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface VictoryCelebrationProps {
  show: boolean;
  rank: number;
  prize: string;
  nftName: string;
  onClose: () => void;
}

export default function VictoryCelebration({ show, rank, prize, nftName, onClose }: VictoryCelebrationProps) {
  useEffect(() => {
    if (show && rank <= 3) {
      // Trigger confetti for winners
      const duration = rank === 1 ? 3000 : 2000;
      const particleCount = rank === 1 ? 200 : 100;
      
      confetti({
        particleCount,
        spread: 70,
        origin: { y: 0.6 },
        colors: rank === 1 ? ['#FFD700', '#FFA500', '#FF6347'] : ['#C0C0C0', '#808080']
      });

      setTimeout(() => {
        confetti({
          particleCount: particleCount / 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, duration / 3);

      setTimeout(() => {
        confetti({
          particleCount: particleCount / 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, duration * 2 / 3);
    }
  }, [show, rank]);

  if (!show) return null;

  const getRankEmoji = () => {
    switch(rank) {
      case 1: return '🏆';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🎉';
    }
  };

  const getRankText = () => {
    switch(rank) {
      case 1: return 'CHAMPION!';
      case 2: return 'SECOND PLACE!';
      case 3: return 'THIRD PLACE!';
      default: return 'GREAT BATTLE!';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", damping: 15, stiffness: 150 }}
            className="bg-black border border-gray-800 p-12 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Trophy Animation */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-8xl mb-4"
              >
                {getRankEmoji()}
              </motion.div>
              
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-4xl font-bold text-white mb-2 uppercase tracking-wider"
              >
                {getRankText()}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl text-gray-300 normal-case"
              >
                {nftName}
              </motion.p>
            </motion.div>

            {/* Prize Display */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-r from-yellow-900/20 to-yellow-600/20 border border-yellow-600/30 p-6 mb-8"
            >
              <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Prize Won</p>
              <p className="text-3xl font-bold text-yellow-500 font-mono">{prize} SUI</p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex gap-4"
            >
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-all button-press"
              >
                Claim Victory
              </button>
              <button
                className="px-4 py-3 border border-gray-800 text-white hover:border-gray-600 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 010-5.684m-9.032 4.026A9.001 9.001 0 015.641 20m9.032-4.026A8.963 8.963 0 0112 21m3.641-5.026a9.001 9.001 0 010-5.684m0 5.684c.202.404.316.86.316 1.342 0 .482-.114.938-.316 1.342m-9.032-4.026A9.001 9.001 0 015.641 4m9.032 4.026A8.963 8.963 0 0112 3m0 0a3 3 0 110 6m0-6a3 3 0 110 6" />
                </svg>
              </button>
            </motion.div>

            {/* Achievement Unlocked */}
            {rank === 1 && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5, type: "spring" }}
                className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🎖️</span>
                  </div>
                  <div>
                    <p className="text-sm text-purple-400 font-bold uppercase tracking-wider">Achievement Unlocked</p>
                    <p className="text-xs text-gray-400 normal-case">First Tournament Victory</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}