'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TournamentFiltersProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: number | null) => void;
  onSortChange: (sort: string) => void;
  onEntryFeeChange?: (range: [number, number]) => void;
  onParticipantsChange?: (range: [number, number]) => void;
  onPrizePoolChange?: (range: [number, number]) => void;
}

export default function TournamentFilters({
  selectedType,
  onTypeChange,
  onStatusChange,
  onSortChange,
  onEntryFeeChange,
  onParticipantsChange,
  onPrizePoolChange
}: TournamentFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [selectedSort, setSelectedSort] = useState('newest');
  const [entryFeeRange, setEntryFeeRange] = useState<[number, number]>([0, 100]);
  const [participantsRange, setParticipantsRange] = useState<[number, number]>([0, 1000]);
  const [prizePoolRange, setPrizePoolRange] = useState<[number, number]>([0, 10000]);
  const [activeFilters, setActiveFilters] = useState(0);
  
  // Load saved filters from localStorage on component mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('tournamentFilters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        if (parsedFilters.selectedStatus !== undefined) {
          setSelectedStatus(parsedFilters.selectedStatus);
          onStatusChange(parsedFilters.selectedStatus);
        }
        if (parsedFilters.selectedSort) {
          setSelectedSort(parsedFilters.selectedSort);
          onSortChange(parsedFilters.selectedSort);
        }
        if (parsedFilters.entryFeeRange && onEntryFeeChange) {
          setEntryFeeRange(parsedFilters.entryFeeRange);
          onEntryFeeChange(parsedFilters.entryFeeRange);
        }
        if (parsedFilters.participantsRange && onParticipantsChange) {
          setParticipantsRange(parsedFilters.participantsRange);
          onParticipantsChange(parsedFilters.participantsRange);
        }
        if (parsedFilters.prizePoolRange && onPrizePoolChange) {
          setPrizePoolRange(parsedFilters.prizePoolRange);
          onPrizePoolChange(parsedFilters.prizePoolRange);
        }
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, [onStatusChange, onSortChange, onEntryFeeChange, onParticipantsChange, onPrizePoolChange]);
  
  // Count active filters
  useEffect(() => {
    let count = 0;
    if (selectedStatus !== null) count++;
    if (entryFeeRange[0] > 0 || entryFeeRange[1] < 100) count++;
    if (participantsRange[0] > 0 || participantsRange[1] < 1000) count++;
    if (prizePoolRange[0] > 0 || prizePoolRange[1] < 10000) count++;
    setActiveFilters(count);
  }, [selectedStatus, entryFeeRange, participantsRange, prizePoolRange]);

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
          className="flex items-center text-sm text-gray-600 hover:text-black transition-colors relative"
        >
          <span className="mr-1">Filters</span>
          {activeFilters > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {activeFilters}
            </span>
          )}
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
            {/* Range Sliders */}
            <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
              <h3 className="text-sm font-medium mb-4">Advanced Filters</h3>
              
              {/* Entry Fee Range */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium">Entry Fee (SUI)</label>
                  <div className="text-xs text-gray-500">
                    {entryFeeRange[0]} - {entryFeeRange[1]}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={entryFeeRange[0]}
                    onChange={(e) => {
                      const min = parseInt(e.target.value);
                      const newRange: [number, number] = [min, Math.max(min, entryFeeRange[1])];
                      setEntryFeeRange(newRange);
                      onEntryFeeChange?.(newRange);
                    }}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={entryFeeRange[1]}
                    onChange={(e) => {
                      const max = parseInt(e.target.value);
                      const newRange: [number, number] = [Math.min(entryFeeRange[0], max), max];
                      setEntryFeeRange(newRange);
                      onEntryFeeChange?.(newRange);
                    }}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Participants Range */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium">Participants</label>
                  <div className="text-xs text-gray-500">
                    {participantsRange[0]} - {participantsRange[1]}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000" 
                    step="10"
                    value={participantsRange[0]}
                    onChange={(e) => {
                      const min = parseInt(e.target.value);
                      const newRange: [number, number] = [min, Math.max(min, participantsRange[1])];
                      setParticipantsRange(newRange);
                      onParticipantsChange?.(newRange);
                    }}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="1000" 
                    step="10"
                    value={participantsRange[1]}
                    onChange={(e) => {
                      const max = parseInt(e.target.value);
                      const newRange: [number, number] = [Math.min(participantsRange[0], max), max];
                      setParticipantsRange(newRange);
                      onParticipantsChange?.(newRange);
                    }}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Prize Pool Range */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium">Prize Pool (SUI)</label>
                  <div className="text-xs text-gray-500">
                    {prizePoolRange[0]} - {prizePoolRange[1]}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    step="100"
                    value={prizePoolRange[0]}
                    onChange={(e) => {
                      const min = parseInt(e.target.value);
                      const newRange: [number, number] = [min, Math.max(min, prizePoolRange[1])];
                      setPrizePoolRange(newRange);
                      onPrizePoolChange?.(newRange);
                    }}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    step="100"
                    value={prizePoolRange[1]}
                    onChange={(e) => {
                      const max = parseInt(e.target.value);
                      const newRange: [number, number] = [Math.min(prizePoolRange[0], max), max];
                      setPrizePoolRange(newRange);
                      onPrizePoolChange?.(newRange);
                    }}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Save/Reset Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => {
                    // Reset all filters
                    setSelectedStatus(null);
                    onStatusChange(null);
                    setSelectedSort('newest');
                    onSortChange('newest');
                    setEntryFeeRange([0, 100]);
                    onEntryFeeChange?.([0, 100]);
                    setParticipantsRange([0, 1000]);
                    onParticipantsChange?.([0, 1000]);
                    setPrizePoolRange([0, 10000]);
                    onPrizePoolChange?.([0, 10000]);
                    
                    // Clear saved filters
                    localStorage.removeItem('tournamentFilters');
                  }}
                  className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Reset All
                </button>
                
                <button
                  onClick={() => {
                    // Save filters to localStorage
                    const filtersToSave = {
                      selectedStatus,
                      selectedSort,
                      entryFeeRange,
                      participantsRange,
                      prizePoolRange
                    };
                    localStorage.setItem('tournamentFilters', JSON.stringify(filtersToSave));
                  }}
                  className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors"
                >
                  Save Filters
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
