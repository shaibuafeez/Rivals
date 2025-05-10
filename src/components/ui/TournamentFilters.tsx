'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface TournamentFiltersProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: number | null) => void;
  onSortChange: (sort: string) => void;
}

export default function TournamentFilters({
  selectedType,
  onTypeChange,
  onStatusChange,
  onSortChange
}: TournamentFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [selectedSort, setSelectedSort] = useState('newest');

  const tournamentTypes = [
    { id: 'all', value: 0, name: 'All Tournaments' },
    { id: 'collections', value: 1, name: 'Collection Battles' },
    { id: 'free', value: 2, name: 'Free For All' },
    { id: 'premium', value: 3, name: 'Premium' }
  ];

  const handleStatusChange = (status: number | null) => {
    setSelectedStatus(status);
    onStatusChange(status);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    onSortChange(sort);
  };

  return (
    <div className="mb-8">
      {/* Tournament Type Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {tournamentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onTypeChange(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedType === type.id
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="flex items-center text-sm text-gray-600 hover:text-black transition-colors"
        >
          <span className="mr-1">Filters</span>
          <svg
            className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Filter */}
            <div>
              <h3 className="text-sm font-medium mb-3">Status</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusChange(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedStatus === null
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleStatusChange(0)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedStatus === 0
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Registration
                </button>
                <button
                  onClick={() => handleStatusChange(1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedStatus === 1
                      ? 'bg-green-600 text-white'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => handleStatusChange(2)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedStatus === 2
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ended
                </button>
              </div>
            </div>
            
            {/* Sort Filter */}
            <div>
              <h3 className="text-sm font-medium mb-3">Sort By</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedSort === 'newest'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => handleSortChange('popular')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedSort === 'popular'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Most Popular
                </button>
                <button
                  onClick={() => handleSortChange('prize')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedSort === 'prize'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Highest Prize
                </button>
                <button
                  onClick={() => handleSortChange('ending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedSort === 'ending'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ending Soon
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
