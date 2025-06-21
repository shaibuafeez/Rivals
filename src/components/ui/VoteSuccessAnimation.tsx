'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface VoteSuccessAnimationProps {
  show: boolean;
  nftName?: string;
}

export default function VoteSuccessAnimation({ show, nftName }: VoteSuccessAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-20, 0] }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 p-8 rounded-lg"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-8 h-8 text-black" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-white uppercase tracking-wider text-center mb-2"
            >
              Vote Submitted!
            </motion.h3>
            
            {nftName && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 text-center"
              >
                You voted for {nftName}
              </motion.p>
            )}
            
            {/* Particle effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 1,
                    scale: 0
                  }}
                  animate={{ 
                    x: Math.cos(i * 60 * Math.PI / 180) * 100,
                    y: Math.sin(i * 60 * Math.PI / 180) * 100,
                    opacity: 0,
                    scale: 1
                  }}
                  transition={{ 
                    duration: 1,
                    delay: 0.2 + i * 0.05,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-500 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}