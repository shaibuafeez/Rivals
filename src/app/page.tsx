'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamic imports to avoid SSR issues
const Navbar = dynamic(() => import('@/components/layout/Navbar'), {
  ssr: false
});

const NFTCarousel = dynamic(() => import('@/components/ui/NFTCarousel'), {
  ssr: false
});

const ConnectWalletButton = dynamic(() => import('@/components/ui/ConnectWalletButton'), {
  ssr: false
});


export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-12 w-full">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 mt-8"
          >
            <h1 className="text-[28px] font-semibold text-gray-900 dark:text-white mb-3">
              Rivals: NFT Battle Platform
            </h1>
            <p className="text-[14px] text-gray-600 dark:text-gray-300 max-w-[700px] mx-auto">
              Enter your NFTs into epic tournaments and battle for SUI prizes. Vote on the best NFTs and claim your share of the prize pool!
            </p>
          </motion.div>

          <div className="mt-6 mb-4">
            <NFTCarousel />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-4">
              <ConnectWalletButton />
              <a 
                href="/tournaments" 
                className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-all duration-200 border border-gray-800 hover:border-gray-600 flex items-center gap-2 group"
              >
                Enter Tournament
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </motion.div>
          
          <div className="mt-12 flex justify-center space-x-8 text-xs text-gray-400 dark:text-gray-500">
            <span className="text-center">© 2024 Rivals • Built on Sui</span>
          </div>
        </div>
      </main>
    </div>
  );
}
