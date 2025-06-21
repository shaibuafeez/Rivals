'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TournamentHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-purple-900 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
          animate={{
            x: [0, -120, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div className="relative max-w-[1200px] mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        {/* Hero text content */}
        <div className="md:w-1/2 mb-10 md:mb-0 z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            NFT Tournaments
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg"
          >
            Submit your NFTs to compete for prizes, recognition, and Sui dominance in our daily, weekly, and monthly tournaments.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/tournaments/create/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Tournament
            </Link>
            <Link 
              href="#active-tournaments" 
              className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Browse Tournaments
            </Link>
          </motion.div>
        </div>
        
        {/* Hero image/illustration */}
        <motion.div 
          className="md:w-1/2 z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative h-[300px] md:h-[400px] w-full">
            {/* Placeholder for NFT tournament illustration */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Trophy icon in the center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-yellow-400">
                    <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* Circular NFT placeholders */}
                <motion.div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-red-600 border-4 border-white shadow-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute top-1/2 left-0 -translate-x-1/4 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-600 border-4 border-white shadow-lg"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 w-18 h-18 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 border-4 border-white shadow-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute top-1/2 right-0 translate-x-1/4 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 border-4 border-white shadow-lg"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
