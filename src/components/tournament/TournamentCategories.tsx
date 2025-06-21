'use client';

import { motion } from 'framer-motion';

interface TournamentCategoriesProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function TournamentCategories({ 
  activeCategory, 
  setActiveCategory 
}: TournamentCategoriesProps) {
  
  const categories = [
    { id: 'all', name: 'All Tournaments' },
    { id: 'active', name: 'Active' },
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'ended', name: 'Ended' }
  ];

  return (
    <div id="active-tournaments" className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse Tournaments</h2>
      
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === category.id
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {activeCategory === category.id && (
              <motion.span
                layoutId="activeCategoryBg"
                className="absolute inset-0 bg-blue-600 rounded-full"
                initial={false}
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
