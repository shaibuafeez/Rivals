'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Tournament } from '@/services/tournamentService';

interface TournamentSearchProps {
  tournaments: Tournament[];
  onSelectTournament: (tournamentId: string) => void;
  onSearch?: (query: string) => void;
  recentSearches?: string[];
}

export default function TournamentSearch({ tournaments, onSelectTournament, onSearch }: TournamentSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSavedSearches(parsed.slice(0, 5)); // Keep only the 5 most recent
        }
      } catch (error) {
        console.error('Error loading saved searches:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTournaments([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Enhanced search with multiple criteria
    const results = tournaments.filter(tournament => {
      // Search in name (highest priority)
      if (tournament.name.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search in description
      if (tournament.description && tournament.description.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search by tournament type
      const typeLabels = ['daily', 'weekly', 'monthly'];
      const typeIndex = typeLabels.findIndex(label => label === query);
      if (typeIndex !== -1 && tournament.tournamentType === typeIndex + 1) {
        return true;
      }
      
      // Search by status
      const statusLabels = ['registration', 'active', 'ended'];
      const statusIndex = statusLabels.findIndex(label => label === query);
      if (statusIndex !== -1 && tournament.status === statusIndex) {
        return true;
      }
      
      // Search by entry fee (free tournaments)
      if ((query === 'free' || query === 'free entry') && tournament.entryFee === '0') {
        return true;
      }
      
      return false;
    }).slice(0, 8); // Limit to 8 results
    
    setFilteredTournaments(results);
  }, [searchQuery, tournaments]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (tournamentId: string) => {
    onSelectTournament(tournamentId);
    
    // Save search query to recent searches
    if (searchQuery.trim()) {
      const newSearches = [searchQuery, ...savedSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setSavedSearches(newSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
    }
    
    setSearchQuery('');
    setIsOpen(false);
    setShowRecent(false);
  };
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Save search query
      const newSearches = [searchQuery, ...savedSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setSavedSearches(newSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      
      // Trigger search callback if provided
      onSearch?.(searchQuery);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto mb-8">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tournaments..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            setShowRecent(e.target.value === '');
          }}
          onFocus={() => {
            setIsOpen(true);
            setShowRecent(searchQuery === '');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
              inputRef.current?.blur();
            }
          }}
          className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 text-sm"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilteredTournaments([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (searchQuery.trim() !== '' ? filteredTournaments.length > 0 : showRecent && savedSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {/* Recent Searches */}
            {searchQuery.trim() === '' && showRecent && savedSearches.length > 0 && (
              <div className="px-4 py-2 bg-gray-50">
                <h3 className="text-xs font-medium text-gray-500 mb-2">Recent Searches</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {savedSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(search)}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search Results */}
            <ul className="divide-y divide-gray-100">
              {searchQuery.trim() !== '' && filteredTournaments.map((tournament) => (
                <li
                  key={tournament.id}
                  onClick={() => handleSelect(tournament.id)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-md overflow-hidden mr-3 flex-shrink-0">
                      {tournament.featuredImage && (
                        <div className="w-full h-full relative">
                          <Image
                            src={tournament.featuredImage}
                            alt={tournament.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{tournament.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {tournament.tournamentType === 1 ? 'Daily' : 
                         tournament.tournamentType === 2 ? 'Weekly' : 'Monthly'} • 
                        {tournament.entryFee === '0' ? ' Free Entry' : ` ${tournament.entryFee} SUI`}
                      </p>
                    </div>
                    <div className="ml-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${tournament.status === 0 ? 'bg-blue-100 text-blue-800' : 
                          tournament.status === 1 ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {tournament.status === 0 ? 'Registration' : 
                         tournament.status === 1 ? 'Active' : 'Ended'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
