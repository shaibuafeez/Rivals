'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useState } from 'react';

// Dynamic imports to avoid SSR issues
const Navbar = dynamic(() => import('@/components/layout/Navbar'), {
  ssr: false
});

const ConnectWalletButton = dynamic(() => import('@/components/ui/ConnectWalletButton'), {
  ssr: false
});

// Tournament types
const tournamentTypes = [
  { id: 'daily', name: 'Daily', description: 'Ends in 8 hours', entryFee: '0.01 SUI' },
  { id: 'weekly', name: 'Weekly', description: 'Ends in 3 days', entryFee: '0.05 SUI' },
  { id: 'monthly', name: 'Monthly', description: 'Ends in 18 days', entryFee: '0.2 SUI' }
];

export default function Tournaments() {
  const [selectedType, setSelectedType] = useState('daily');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-28 pb-8">
        <div className="max-w-[1000px] mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-[32px] font-semibold text-gray-900 mb-4">
              NFT Tournaments
            </h1>
            <p className="text-[15px] text-gray-600 max-w-[600px] mx-auto">
              Enter your NFTs in tournaments to compete for SUI rewards and bragging rights.
              The more votes your NFT gets, the higher it ranks!
            </p>
          </motion.div>

          {/* Tournament Type Selector */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-gray-100 rounded-lg">
              {tournamentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedType === type.id
                      ? 'bg-white shadow-sm text-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tournament Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-lg">Tournament #{index}</h3>
                      <p className="text-sm text-gray-500">
                        {tournamentTypes.find(t => t.id === selectedType)?.description}
                      </p>
                    </div>
                    <div className="bg-black text-white text-xs px-3 py-1 rounded-full">
                      {tournamentTypes.find(t => t.id === selectedType)?.entryFee}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <span className="text-gray-500">Participants:</span> {42 + index * 8}
                      </div>
                    </div>
                    <button className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                      Enter Tournament
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Create Tournament CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center bg-gray-50 p-8 rounded-xl border border-gray-100"
          >
            <h3 className="text-xl font-medium mb-2">Create Your Own Tournament</h3>
            <p className="text-gray-600 mb-4 max-w-[500px] mx-auto text-sm">
              Set your own rules, entry fees, and prize distribution. Invite friends and the community to participate.
            </p>
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
