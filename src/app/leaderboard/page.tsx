'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

// Dynamic imports to avoid SSR issues
const Navbar = dynamic(() => import('@/components/layout/Navbar'), {
  ssr: false
});

const ConnectWalletButton = dynamic(() => import('@/components/ui/ConnectWalletButton'), {
  ssr: false
});

// Sample leaderboard data
const leaderboardData = [
  { rank: 1, name: 'Doonies #337', owner: '@van.sui', votes: 1254, image: '/images/nft-skull.png' },
  { rank: 2, name: 'Suiverse #42', owner: '@0xnova', votes: 1187, image: '/images/nft-skull.png' },
  { rank: 3, name: 'SuiPunks #789', owner: '@sui.master', votes: 1043, image: '/images/nft-skull.png' },
  { rank: 4, name: 'Doonies #128', owner: '@collector', votes: 978, image: '/images/nft-skull.png' },
  { rank: 5, name: 'SuiPunks #456', owner: '@nft.whale', votes: 901, image: '/images/nft-skull.png' },
  { rank: 6, name: 'Suiverse #77', owner: '@crypto.art', votes: 876, image: '/images/nft-skull.png' },
  { rank: 7, name: 'Doonies #512', owner: '@sui.fan', votes: 812, image: '/images/nft-skull.png' },
  { rank: 8, name: 'SuiPunks #333', owner: '@nft.guru', votes: 798, image: '/images/nft-skull.png' },
  { rank: 9, name: 'Suiverse #199', owner: '@pixel.lord', votes: 743, image: '/images/nft-skull.png' },
  { rank: 10, name: 'Doonies #888', owner: '@sui.collector', votes: 721, image: '/images/nft-skull.png' },
];

// Time periods for filtering
const timePeriods = [
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'allTime', name: 'All Time' }
];

export default function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

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
              NFT Leaderboard
            </h1>
            <p className="text-[15px] text-gray-600 max-w-[600px] mx-auto">
              See which NFTs are dominating the competition across different time periods.
              The more votes an NFT receives, the higher it ranks!
            </p>
          </motion.div>

          {/* Time Period Selector */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-gray-100 rounded-lg">
              {timePeriods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedPeriod === period.id
                      ? 'bg-white shadow-sm text-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {period.name}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8 relative"
          >
            {/* Coming Soon Banner */}
            <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black py-1.5 text-center text-sm font-medium z-10">
              Sample Data • Live Leaderboard Coming Soon
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NFT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaderboardData.map((item) => (
                    <tr key={item.rank} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                          item.rank <= 3 
                            ? 'bg-black text-white' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.owner}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {item.votes.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center bg-gray-50 p-8 rounded-xl border border-gray-100"
          >
            <h3 className="text-xl font-medium mb-2">Want to see your NFT on the leaderboard?</h3>
            <p className="text-gray-600 mb-4 max-w-[500px] mx-auto text-sm">
              Connect your wallet and enter your NFTs in tournaments to start competing for the top spots.
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
