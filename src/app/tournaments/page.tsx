'use client';

import { useState, useEffect } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Tournament } from '@/services/tournamentService';
import { useWallet } from '@/hooks/useWallet';
import { useTournaments } from '@/hooks/useTournaments';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import TournamentCreationModal from '@/components/tournaments/TournamentCreationModal';
import { useRouter } from 'next/navigation';

// Dynamic imports to avoid SSR issues
const Navbar = dynamic(() => import('@/components/layout/Navbar'), {
  ssr: false
});

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function TournamentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isConnected } = useWallet();
  const { tournaments, loading: isLoading, fetchTournaments } = useTournaments();
  const router = useRouter();

  // Fetch tournaments when connected
  useEffect(() => {
    if (isConnected) {
      fetchTournaments?.();
    }
  }, [isConnected]); // Intentionally omit fetchTournaments to avoid infinite loop

  // Filter tournaments based on search and category
  const filteredTournaments = tournaments.filter(t => {
    // Search filter
    if (searchQuery && !(
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      // Add category filtering logic here
    }
    
    // Status filter
    if (selectedStatus !== 'all') {
      // Add status filtering logic here
    }
    
    return true;
  });

  return (
    <ErrorBoundary>
      <MotionConfig transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}>
        <div className="min-h-screen bg-[#0a0a0a]">
          <Navbar />
          
          <main className="bg-[#0a0a0a]">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
              {/* Geometric Pattern */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-gray-800"></div>
                <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-gray-800"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-gray-800"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-gray-800"></div>
              </div>

              <div className="relative z-10 px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 sm:py-24 lg:py-32">
                <div className="max-w-6xl mx-auto">
                  <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <div>
                      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight">
                        TOURNAMENT
                        <span className="block text-gray-400">ARENA</span>
                      </h1>
                      <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-6 sm:mb-8 max-w-xl normal-case">
                        Enter the battlefield where NFTs compete for glory and prizes. Vote for your favorites and claim victory.
                      </p>
                    </div>

                    {/* Right Stats */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                      <div className="border border-gray-800 p-4 sm:p-6 lg:p-8">
                        <div className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2">{tournaments?.length || '4'}</div>
                        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Active Tournaments</div>
                      </div>
                      <div className="border border-gray-800 p-4 sm:p-6 lg:p-8">
                        <div className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2">1.2K</div>
                        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Total Players</div>
                      </div>
                      <div className="border border-gray-800 p-4 sm:p-6 lg:p-8">
                        <div className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2">500</div>
                        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">SUI Prize Pool</div>
                      </div>
                      <div className="border border-gray-800 p-4 sm:p-6 lg:p-8">
                        <div className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2">24H</div>
                        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Daily Battles</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Filters Section */}
            <section className="sticky top-16 z-40 bg-[#0a0a0a] border-b border-gray-800">
              <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  {/* Search Bar */}
                  <div className="w-full lg:w-96">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search tournaments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-12 bg-black border border-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                      />
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex gap-3 items-center">
                    <div className="flex bg-black border border-gray-800 p-1">
                      {['all', 'active', 'upcoming', 'completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          className={`px-4 py-2 text-sm font-medium transition-all ${
                            selectedStatus === status
                              ? 'bg-white text-black'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>

                    {isConnected && (
                      <motion.button
                        onClick={() => setShowCreateModal(true)}
                        className="hidden md:flex px-6 py-3 bg-white text-black font-bold items-center gap-2 hover:bg-gray-200 transition-all rounded-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        CREATE
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-6 mt-4 overflow-x-auto pb-2">
                  {['all', 'daily', 'weekly', 'monthly', 'special'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-all uppercase tracking-wider ${
                        selectedCategory === category
                          ? 'text-white border-white'
                          : 'text-gray-400 border-transparent hover:text-gray-300'
                      }`}
                    >
                      {category} Tournaments
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Featured Tournaments Carousel */}
            <section className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 bg-[#0a0a0a]">
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-8 uppercase tracking-wider">Featured Tournaments</h2>
                
                {/* Featured Carousel */}
                <div className="relative">
                  <motion.div 
                    id="featured-carousel"
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {filteredTournaments.slice(0, 3).map((tournament, index) => (
                      <motion.div
                        key={`featured-${tournament.id}`}
                        className="min-w-[280px] sm:min-w-[400px] md:min-w-[600px] lg:min-w-[700px] snap-start"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="relative h-[300px] sm:h-[400px] md:h-[500px] bg-black border border-gray-800 overflow-hidden group hover:border-gray-600 transition-all duration-500">
                          {/* Glow Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-50 blur-3xl transition-all duration-700 scale-110 -z-10"></div>
                          
                          {/* Background Image */}
                          <div 
                            className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity duration-500"
                            style={{
                              backgroundImage: `url('/images/${(index % 5) + 1}.png')`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                          
                          {/* Inner Glow Shadow */}
                          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(99,102,241,0)] group-hover:shadow-[inset_0_0_100px_rgba(99,102,241,0.4)] transition-all duration-700 z-10"></div>
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                          
                          {/* Geometric Corner Accents */}
                          <div className="absolute top-0 left-0 w-8 h-8 sm:w-12 md:w-16 sm:h-12 md:h-16 border-l-2 border-t-2 border-white"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-12 md:w-16 sm:h-12 md:h-16 border-r-2 border-b-2 border-white"></div>
                          
                          {/* Tournament Type Badge */}
                          <div className="absolute top-3 left-3 sm:top-4 md:top-6 sm:left-4 md:left-6 z-10">
                            <span className="px-2 py-1 sm:px-3 md:px-4 sm:py-1.5 md:py-2 bg-white text-black text-xs sm:text-sm font-bold uppercase tracking-wider">
                              Featured
                            </span>
                          </div>
                          
                          {/* Content */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10 z-10">
                            <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 uppercase">
                              {tournament.name}
                            </h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-400 mb-3 sm:mb-4 md:mb-6 line-clamp-2 normal-case">
                              {tournament.description}
                            </p>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                              <div className="border border-gray-800 p-2 sm:p-2.5 md:p-3">
                                <div className="text-sm sm:text-xl md:text-2xl font-bold text-white">{tournament.totalParticipants || 0}</div>
                                <div className="text-[10px] sm:text-xs text-gray-400 uppercase">Players</div>
                              </div>
                              <div className="border border-gray-800 p-2 sm:p-2.5 md:p-3">
                                <div className="text-sm sm:text-xl md:text-2xl font-bold text-white">{tournament.prizePool || '50'}</div>
                                <div className="text-[10px] sm:text-xs text-gray-400 uppercase">SUI Pool</div>
                              </div>
                              <div className="border border-gray-800 p-2 sm:p-2.5 md:p-3">
                                <div className="text-sm sm:text-xl md:text-2xl font-bold text-white">24H</div>
                                <div className="text-[10px] sm:text-xs text-gray-400 uppercase">Remaining</div>
                              </div>
                            </div>
                            
                            {/* Action Button */}
                            <motion.a
                              href={`/tournaments/${tournament.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-white text-black font-bold text-xs sm:text-sm md:text-base uppercase tracking-wider hover:bg-gray-200 transition-all w-full justify-center"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Enter Battle
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </motion.a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {/* Navigation Arrows */}
                  <button 
                    onClick={() => {
                      const carousel = document.getElementById('featured-carousel');
                      if (carousel) {
                        carousel.scrollBy({ left: -700, behavior: 'smooth' });
                        setCurrentSlide(Math.max(0, currentSlide - 1));
                      }
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black border border-gray-800 flex items-center justify-center text-white hover:border-gray-600 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => {
                      const carousel = document.getElementById('featured-carousel');
                      if (carousel) {
                        carousel.scrollBy({ left: 700, behavior: 'smooth' });
                        setCurrentSlide(Math.min(2, currentSlide + 1));
                      }
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black border border-gray-800 flex items-center justify-center text-white hover:border-gray-600 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                {/* Scroll Indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {[0, 1, 2].map((index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const carousel = document.getElementById('featured-carousel');
                        if (carousel) {
                          carousel.scrollTo({ left: index * 700, behavior: 'smooth' });
                          setCurrentSlide(index);
                        }
                      }}
                      className={`h-1 transition-all duration-300 ${
                        currentSlide === index 
                          ? 'w-8 bg-white' 
                          : 'w-2 bg-gray-400 hover:bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Active Tournaments Grid */}
            <section className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pb-12 bg-[#0a0a0a]">
              <h2 className="text-3xl font-bold text-white mb-8 uppercase tracking-wider">Active Tournaments</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    <div className="absolute inset-0 rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400 animate-spin" style={{ animationDelay: '0.2s', animationDirection: 'reverse' }}></div>
                  </div>
                </div>
              ) : filteredTournaments.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerChildren}
                  initial="initial"
                  animate="animate"
                >
                  {filteredTournaments.map((tournament, index) => (
                    <motion.div
                      key={tournament.id}
                      variants={fadeInUp}
                      custom={index}
                      whileHover={{ y: -8 }}
                      className="group card-appear hover-lift"
                    >
                      <div className={`relative bg-black border border-gray-800 overflow-hidden hover:border-gray-600 transition-all duration-300 group ${
                        tournament.tournamentType === 3 ? 'tournament-card-monthly' :
                        tournament.tournamentType === 2 ? 'tournament-card-weekly' :
                        'tournament-card-daily'
                      }`}>
                        {/* Gradient Accent Line */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Tournament ID Badge */}
                        <div className="absolute top-0 right-0 px-3 py-1 bg-gray-900/90 backdrop-blur-sm border-l border-b border-gray-800">
                          <span className="text-xs text-gray-400 font-mono">#{index + 1}</span>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          {/* Header with Time Remaining */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                                  {tournament.name}
                                </h3>
                                {/* Tournament Type Indicator */}
                                <div className={`tournament-type-indicator ${
                                  tournament.tournamentType === 3 ? 'tournament-type-monthly' :
                                  tournament.tournamentType === 2 ? 'tournament-type-weekly' :
                                  'tournament-type-daily'
                                } ${tournament.status === 1 ? 'tournament-status-active' : ''}`} />
                              </div>
                              <p className="text-gray-400 text-xs uppercase">
                                {tournament.tournamentType || 'DAILY'} TOURNAMENT
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-mono text-white">24:00:00</div>
                              <div className="text-xs text-gray-400 uppercase">Remaining</div>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-400 text-sm mb-6 line-clamp-2 normal-case">
                            {tournament.description}
                          </p>

                          {/* Visual Stats Bar */}
                          <div className="mb-6">
                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                              <span>{tournament.totalParticipants || 0} / 100 PLAYERS</span>
                              <span>{((tournament.totalParticipants || 0) / 100 * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-1 bg-gray-900 relative">
                              <motion.div 
                                className="absolute top-0 left-0 h-full bg-white"
                                initial={{ width: 0 }}
                                animate={{ width: `${((tournament.totalParticipants || 0) / 100 * 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>

                          {/* Stats Row */}
                          <div className="flex justify-between items-center mb-6 py-4 border-t border-b border-gray-800">
                            <div>
                              <div className="text-xs text-gray-400 uppercase">Entry Fee</div>
                              <div className="text-lg font-bold text-white font-mono">
                                {tournament.entryFee || '0.01'} SUI
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400 uppercase">Prize Pool</div>
                              <div className="text-lg font-bold text-white font-mono">
                                {tournament.prizePool || '10'} SUI
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-400 uppercase mb-1">Prize Split</div>
                              <div className="flex gap-1 justify-end">
                                <div className="text-xs font-mono text-gray-400">60%</div>
                                <div className="text-xs font-mono text-gray-400">30%</div>
                                <div className="text-xs font-mono text-gray-400">10%</div>
                              </div>
                            </div>
                          </div>

                          {/* Action Area */}
                          <div className="flex gap-3">
                            <motion.a
                              href={`/tournaments/${tournament.id}`}
                              className="flex-1 py-3 bg-white text-black text-center font-bold uppercase tracking-wider hover:bg-gray-200 transition-all rounded-full button-press"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              ENTER
                            </motion.a>
                            <button className="px-4 py-3 border border-gray-800 text-white hover:border-gray-400 transition-all group rounded-full">
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Hover Effect - Subtle Glow */}
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.02] transition-opacity pointer-events-none" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-24">
                  <div className="text-6xl mb-4">⚔️</div>
                  <h3 className="text-2xl font-bold text-white mb-2 uppercase">
                    No tournaments found
                  </h3>
                  <p className="text-gray-400 mb-8">
                    Be the first to create an epic NFT battle!
                  </p>
                  {isConnected && (
                    <motion.button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase hover:bg-gray-200 transition-all rounded-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create First Tournament
                    </motion.button>
                  )}
                </div>
              )}
            </section>
          </main>
        </div>
        
        {/* Tournament Creation Modal */}
        <TournamentCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(tournamentId) => {
            setShowCreateModal(false);
            router.push(`/tournaments/${tournamentId}`);
          }}
        />
      </MotionConfig>
    </ErrorBoundary>
  );
}