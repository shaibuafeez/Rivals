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
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-28 pb-8">
        <div className="max-w-[1000px] mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h1 className="text-[32px] font-semibold text-gray-900 mb-4">
              NFT Tournaments To Battle For Sui Dominance
            </h1>
            <p className="text-[15px] text-gray-600 max-w-[600px] mx-auto">
              Submit your NFT against others to see who comes out on top with daily, weekly, and monthly tournaments. Swipe left or right to vote!
            </p>
          </motion.div>

          <div className="mt-8 mb-6">
            <NFTCarousel />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center -mt-4"
          >
            <ConnectWalletButton />
          </motion.div>

          <div className="mt-12 flex justify-center space-x-8 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms of service</a>
          </div>
        </div>
      </main>
    </div>
  );
}
