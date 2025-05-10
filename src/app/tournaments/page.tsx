'use client';

import dynamic from 'next/dynamic';
// motion import removed as it's no longer needed
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSuiClient } from '@mysten/dapp-kit';
import { castToSuiClient } from '@/types/sui-client';
import { useWallet } from '@/hooks/useWallet';
import { TournamentService, Tournament } from '@/services/tournamentService';

// Dynamic imports to avoid SSR issues
const Navbar = dynamic(() => import('@/components/layout/Navbar'), {
  ssr: false
});

const TournamentHero = dynamic(() => import('@/components/ui/TournamentHero'), {
  ssr: false
});

const ModernTournamentCard = dynamic(() => import('@/components/ui/ModernTournamentCard'), {
  ssr: false
});

const NFTSelectionModal = dynamic(() => import('@/components/ui/NFTSelectionModal'), {
  ssr: false
});

// Create Tournament feature removed

// ConnectWalletButton import removed as it's no longer needed

const TournamentStats = dynamic(() => import('@/components/ui/TournamentStats'), {
  ssr: false
});

const TournamentSearch = dynamic(() => import('@/components/ui/TournamentSearch'), {
  ssr: false
});

const TournamentFilters = dynamic(() => import('@/components/ui/TournamentFilters'), {
  ssr: false
});

const TrendingTournaments = dynamic(() => import('@/components/ui/TrendingTournaments'), {
  ssr: false
});

const UpcomingTournament = dynamic(() => import('@/components/ui/UpcomingTournament'), {
  ssr: false
});

const TournamentCategories = dynamic(() => import('@/components/ui/TournamentCategories'), {
  ssr: false
});

export default function Tournaments() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [selectedSort, setSelectedSort] = useState('newest');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [upcomingTournament, setUpcomingTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);
  // Create Tournament feature removed
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalPrizePool: '0',
    totalParticipants: 0
  });
  
  const suiClient = useSuiClient();
  const { isConnected } = useWallet();
  // Use our utility function to safely cast the SuiClient
  const tournamentService = useMemo(() => new TournamentService(castToSuiClient(suiClient)), [suiClient]);

  // Using useCallback to avoid dependency issues
  const applyFilters = useCallback((data: Tournament[]) => {
    let filtered = [...data];
    
    // Filter by type
    if (selectedType !== 'all') {
      if (selectedType === 'collections') {
        filtered = filtered.filter(t => t.allowedCollections && t.allowedCollections.length > 0);
      } else if (selectedType === 'free') {
        filtered = filtered.filter(t => t.entryFee === '0');
      } else if (selectedType === 'premium') {
        filtered = filtered.filter(t => parseFloat(t.entryFee) >= 0.1);
      }
    }
    
    // Filter by status
    if (selectedStatus !== null) {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }
    
    // Apply sorting
    if (selectedSort === 'newest') {
      filtered.sort((a, b) => b.startTime - a.startTime);
    } else if (selectedSort === 'popular') {
      filtered.sort((a, b) => b.totalParticipants - a.totalParticipants);
    } else if (selectedSort === 'prize') {
      filtered.sort((a, b) => parseFloat(b.prizePool || '0') - parseFloat(a.prizePool || '0'));
    } else if (selectedSort === 'ending') {
      filtered.sort((a, b) => {
        if (a.status !== 1) return 1;
        if (b.status !== 1) return -1;
        return a.endTime - b.endTime;
      });
    }
    
    setFilteredTournaments(filtered);
  }, [selectedType, selectedStatus, selectedSort]);
  
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const data = await tournamentService.getTournaments();
        setTournaments(data);
        
        // Calculate stats
        const activeTournaments = data.filter(t => t.status === 1).length;
        const totalPrizePool = data.reduce((sum, t) => sum + parseFloat(t.prizePool || '0'), 0).toString();
        const totalParticipants = data.reduce((sum, t) => sum + t.totalParticipants, 0);
        
        setStats({
          totalTournaments: data.length,
          activeTournaments,
          totalPrizePool,
          totalParticipants
        });
        
        // Find upcoming tournament (first tournament in registration phase)
        const upcoming = data.find(t => t.status === 0);
        if (upcoming) {
          setUpcomingTournament(upcoming);
        }
        
        // Apply initial filters
        applyFilters(data);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [tournamentService, applyFilters]);
  
  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters(tournaments);
  }, [tournaments, applyFilters]);
  


  const handleEnterTournament = (tournament: Tournament) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setSelectedTournament(tournament);
    setIsNFTModalOpen(true);
  };

  // Create Tournament feature removed
  
  const handleTournamentSelect = (tournamentId: string) => {
    router.push(`/tournaments/${tournamentId}`);
  };

  const handleNFTRegistered = () => {
    // Refetch tournaments after NFT registration
    const fetchTournaments = async () => {
      try {
        const data = await tournamentService.getTournaments();
        if (selectedType === 'all') {
          setTournaments(data);
        } else if (selectedType === 'collections') {
          setTournaments(data.filter(t => t.allowedCollections && t.allowedCollections.length > 0));
        } else if (selectedType === 'free') {
          setTournaments(data.filter(t => t.entryFee === '0'));
        } else if (selectedType === 'premium') {
          setTournaments(data.filter(t => parseFloat(t.entryFee) >= 0.1));
        }
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      }
    };

    fetchTournaments();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-16">
        <TournamentHero />
        
        <div className="container mx-auto px-4 py-12">
          {/* Tournament Stats */}
          <TournamentStats 
            totalTournaments={stats.totalTournaments}
            activeTournaments={stats.activeTournaments}
            totalPrizePool={stats.totalPrizePool}
            totalParticipants={stats.totalParticipants}
          />
          
          {/* Tournament Search */}
          <TournamentSearch 
            tournaments={tournaments}
            onSelectTournament={handleTournamentSelect}
          />
          
          {/* Tournament Categories */}
          <TournamentCategories />
          
          {/* Featured Upcoming Tournament */}
          {upcomingTournament && (
            <UpcomingTournament tournament={upcomingTournament} />
          )}
          
          {/* Trending Tournaments */}
          <TrendingTournaments tournaments={tournaments} />
          
          {/* Tournament Filters */}
          <h2 className="text-2xl font-bold mb-6">Browse Tournaments</h2>
          
          <TournamentFilters 
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            onStatusChange={setSelectedStatus}
            onSortChange={setSelectedSort}
          />
          
          {/* Tournament Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-64 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 mb-10">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No tournaments match your filters</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                There are no tournaments matching your current filter criteria. Try adjusting your filters or check back later.
              </p>
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedStatus(null);
                  setSelectedSort('newest');
                }}
                className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {filteredTournaments.map((tournament) => (
                <ModernTournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onEnter={handleEnterTournament}
                />
              ))}
            </div>
          )}

          {/* Create Tournament feature removed */}

          <div className="mt-12 flex justify-center space-x-8 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms of service</a>
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedTournament && (
        <NFTSelectionModal 
          isOpen={isNFTModalOpen}
          onClose={() => setIsNFTModalOpen(false)}
          tournamentId={selectedTournament.id}
          entryFee={selectedTournament.entryFee}
          onSuccess={handleNFTRegistered}
        />
      )}

      {/* Create Tournament feature removed */}
    </div>
  );
}
