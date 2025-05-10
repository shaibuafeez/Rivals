'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TournamentCategories() {
  const categories = [
    {
      id: 'daily',
      name: 'Daily Tournaments',
      description: 'Quick competitions with fast rewards',
      icon: '/images/icons/clock.svg',
      color: 'from-blue-500 to-cyan-400',
      link: '/tournaments?type=daily'
    },
    {
      id: 'collections',
      name: 'Collection Battles',
      description: 'Compete with your NFT collections',
      icon: '/images/icons/collection.svg',
      color: 'from-purple-500 to-pink-400',
      link: '/tournaments?type=collections'
    },
    {
      id: 'free',
      name: 'Free Entry',
      description: 'No entry fee required to participate',
      icon: '/images/icons/ticket.svg',
      color: 'from-green-500 to-emerald-400',
      link: '/tournaments?type=free'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'High stakes, bigger rewards',
      icon: '/images/icons/diamond.svg',
      color: 'from-amber-500 to-yellow-400',
      link: '/tournaments?type=premium'
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Tournament Categories</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={category.link}>
              <div className={`bg-gradient-to-r ${category.color} rounded-xl p-6 h-full text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1`}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    {/* Fallback icon if SVG is not available */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg">{category.name}</h3>
                </div>
                <p className="text-white/80 text-sm">{category.description}</p>
                
                <div className="mt-4 flex justify-end">
                  <div className="bg-white/20 rounded-full p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
