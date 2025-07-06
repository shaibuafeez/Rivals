'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSuiClient } from '@mysten/dapp-kit';
import { useWallet } from '@/hooks/useWallet';
import toast from 'react-hot-toast';
import { SuiClient } from '@mysten/sui/client';
import { NFTEntry, Tournament } from '@/services/tournamentService';
import NFTSelectionModal from '@/components/ui/NFTSelectionModal';
import ShareTournamentEntry from '@/components/ui/ShareTournamentEntry';
import NFTVotingGallery from '@/components/voting/NFTVotingGallery';
import NFTLeaderboard from '@/components/tournament/NFTLeaderboard';
import TournamentNFTGallery from '@/components/tournament/TournamentNFTGallery';
import TournamentEntryModal from '@/components/tournaments/TournamentEntryModal';
import { ArrowLeft, Clock, Users, Trophy, Target } from 'lucide-react';
import { castToSuiClient } from '@/types/sui-client';
import Navbar from '@/components/layout/Navbar';
import VoteSuccessAnimation from '@/components/ui/VoteSuccessAnimation';
import confetti from 'canvas-confetti';
import { type TournamentEntry, convertSimpleEntry } from '@/types/tournament';
import { formatRemainingTime, shouldShowSeconds } from '@/constants/durations';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function TournamentDetails() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params?.id as string;

  // Load simple tournament data instead of using old tournament system
  useEffect(() => {
    const loadSimpleTournament = async () => {
      if (!tournamentId) return;
      
      try {
        setLoading(true);
        
        // Initialize simple tournament service
        const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL! });
        const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID!;
        const service = new (await import('@/services/simpleTournamentService')).SimpleTournamentService(suiClient, PACKAGE_ID);
        
        // Get tournament details
        const tournamentData = await service.getTournament(tournamentId);
        if (tournamentData) {
          // Convert to Tournament interface for compatibility
          const adaptedTournament: Tournament = {
            id: tournamentData.id,
            name: tournamentData.name,
            description: tournamentData.description,
            tournamentType: 1,
            status: (Date.now() < tournamentData.endTime && !tournamentData.ended) ? 1 : 2,
            startTime: Date.now() - (72 * 60 * 60 * 1000),
            endTime: tournamentData.endTime,
            entryFee: '10000000', // 0.01 SUI
            totalParticipants: tournamentData.entriesCount,
            featuredImage: tournamentData.bannerUrl,
            bannerImage: tournamentData.bannerUrl,
            prizePool: tournamentData.prizePool.toString(),
            is_azur_guardian_exclusive: true
          };
          setTournament(adaptedTournament);
          
          // Set finalized state based on the 'ended' field from the contract
          setIsFinalized(tournamentData.ended);
          
          // Load entries
          const entries = await service.getTournamentEntries(tournamentId);
          const mappedEntries = entries.map(entry => ({
            id: entry.nftId, // Use nftId as id
            nftId: entry.nftId,
            owner: entry.submitter,
            name: `NFT ${entry.nftId.slice(0, 8)}...`,
            imageUrl: entry.imageUrl,
            votes: entry.voteCount,
            tournamentId: tournamentId
          }));
          setNftEntries(mappedEntries);
        }
      } catch (error) {
        // Error handled with toast notification
        toast.error('Tournament not found');
      } finally {
        setLoading(false);
      }
    };
    
    loadSimpleTournament();
  }, [tournamentId]);
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [entryId, setEntryId] = useState('');
  const [nftEntries, setNftEntries] = useState<NFTEntry[]>([]);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showVoteSuccess, setShowVoteSuccess] = useState(false);
  const [votedNftName, setVotedNftName] = useState('');
  // Removed bracket-related state since we're using voting gallery now
  const [lastVoteTime, setLastVoteTime] = useState<number | null>(null);
  const [votingForNFT, setVotingForNFT] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedNftId, setVotedNftId] = useState<string | undefined>(undefined);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isFinalizingTournament, setIsFinalizingTournament] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Get wallet info early
  const { isConnected, address, executeTransaction } = useWallet();
  const suiClient = useSuiClient();
  
  // Add logging for modal state changes
  useEffect(() => {
    if (isNFTModalOpen) {
    }
  }, [isNFTModalOpen]);
  
  useEffect(() => {
    if (showEntryModal) {
    }
  }, [showEntryModal]);
  
  // Add periodic refresh for vote counts during active tournaments
  useEffect(() => {
    if (!tournament || tournament.status !== 1) return;
    
    const refreshInterval = setInterval(async () => {
      try {
        // Skip if user just voted (to avoid overwriting optimistic updates)
        if (lastVoteTime && Date.now() - lastVoteTime < 5000) return;
        
        console.log('🔄 Periodic vote count refresh...');
        const { SimpleTournamentService } = await import('@/services/simpleTournamentService');
        const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL! });
        const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID!;
        const service = new SimpleTournamentService(suiClient, PACKAGE_ID);
        
        const entries = await service.getTournamentEntries(tournamentId);
        const updatedEntries = entries.map(entry => ({
          id: entry.nftId,
          nftId: entry.nftId,
          owner: entry.submitter,
          name: `NFT ${entry.nftId.slice(0, 8)}...`,
          imageUrl: entry.imageUrl,
          votes: entry.voteCount,
          tournamentId: tournamentId
        }));
        
        // Only update if there are actual changes
        const hasChanges = updatedEntries.some(newEntry => {
          const oldEntry = nftEntries.find(e => e.nftId === newEntry.nftId);
          return !oldEntry || oldEntry.votes !== newEntry.votes;
        });
        
        if (hasChanges) {
          console.log('✅ Vote counts changed, updating UI');
          setNftEntries(updatedEntries);
        }
      } catch (error) {
        console.error('Error in periodic refresh:', error);
      }
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(refreshInterval);
  }, [tournament?.status, tournamentId, lastVoteTime, nftEntries.length]);
  
  // Removed bracket generation - using voting gallery instead

  // Generate tournament brackets from entries
  // Removed generateBrackets function - using voting gallery instead

  // Real-time countdown timer
  useEffect(() => {
    if (!tournament) return;

    const updateTimer = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.floor((tournament.endTime - now) / 1000));
      
      if (timeLeft === 0) {
        setTimeRemaining('Ended');
        return;
      }
      
      const days = Math.floor(timeLeft / (24 * 60 * 60));
      const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
      const seconds = Math.floor(timeLeft % 60);
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [tournament]);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        setLoading(true);
        
        // Use SimpleTournamentService directly to avoid SuiClient compatibility issues
        const { SimpleTournamentService } = await import('@/services/simpleTournamentService');
        const realSuiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL! });
        const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID!;
        const service = new SimpleTournamentService(realSuiClient, PACKAGE_ID);
        
        // Get tournament details directly
        const tournamentData = await service.getTournament(tournamentId);
        
        if (tournamentData) {
          // Convert to Tournament interface for UI compatibility
          const adaptedTournament: Tournament = {
            id: tournamentData.id,
            name: tournamentData.name,
            description: tournamentData.description,
            tournamentType: 1,
            status: (Date.now() < tournamentData.endTime && !tournamentData.ended) ? 1 : 2,
            startTime: Date.now() - (72 * 60 * 60 * 1000),
            endTime: tournamentData.endTime,
            entryFee: '10000000', // 0.01 SUI
            totalParticipants: tournamentData.entriesCount,
            featuredImage: tournamentData.bannerUrl,
            bannerImage: tournamentData.bannerUrl,
            prizePool: tournamentData.prizePool.toString(),
            is_azur_guardian_exclusive: true
          };
          setTournament(adaptedTournament);
          
          // Set finalized state
          setIsFinalized(tournamentData.ended);
          
          // Get tournament entries
          const entries = await service.getTournamentEntries(tournamentId);
          setNftEntries(entries.map(entry => ({
            id: entry.nftId, // Use nftId as id
            nftId: entry.nftId,
            owner: entry.submitter, // Map submitter to owner for UI compatibility
            name: `NFT ${entry.nftId.slice(0, 8)}...`,
            imageUrl: entry.imageUrl,
            votes: entry.voteCount,
            tournamentId: tournamentId
          })));
        } else {
          localStorage.removeItem('lastEnteredTournament');
          setHasEntered(false);
          setEntryId('');
        }
        
        // Check if user has already entered this tournament
        if (typeof window !== 'undefined') {
          try {
            const lastEnteredTournament = localStorage.getItem('lastEnteredTournament');
            let localStorageHasEntry = false;
            let localEntryId = '';
            
            if (lastEnteredTournament) {
              const parsed = JSON.parse(lastEnteredTournament);
              if (parsed.tournamentId === tournamentId) {
                localStorageHasEntry = true;
                localEntryId = parsed.entryId;
              }
            }
            
            setHasEntered(localStorageHasEntry);
            setEntryId(localEntryId);
            
            // Check if user has voted (if wallet is connected)
            if (address && service) {
              try {
                const userHasVoted = await service.hasUserVoted(tournamentId, address);
                setHasVoted(userHasVoted);
                
                // Try to find which NFT they voted for from localStorage
                const votedNftKey = `voted_${tournamentId}_${address}`;
                const storedVotedNft = localStorage.getItem(votedNftKey);
                if (storedVotedNft) {
                  setVotedNftId(storedVotedNft);
                }
              } catch (error) {
                console.error('Error checking vote status:', error);
              }
            }
            
          } catch (error) {
            console.error('Error checking entry status:', error);
            setHasEntered(false);
            setEntryId('');
          }
        }
      } catch (error) {
        console.error('Error fetching tournament data:', error);
        toast.error('Failed to load tournament data');
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId) {
      fetchTournamentData();
    }
  }, [tournamentId]);

  // Check voting status when wallet connects
  useEffect(() => {
    const checkVotingStatus = async () => {
      if (!address || !tournamentId) return;
      
      try {
        const { SimpleTournamentService } = await import('@/services/simpleTournamentService');
        const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL! });
        const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID!;
        const service = new SimpleTournamentService(suiClient, PACKAGE_ID);
        
        const userHasVoted = await service.hasUserVoted(tournamentId, address);
        setHasVoted(userHasVoted);
        
        // Try to find which NFT they voted for from localStorage
        const votedNftKey = `voted_${tournamentId}_${address}`;
        const storedVotedNft = localStorage.getItem(votedNftKey);
        if (storedVotedNft) {
          setVotedNftId(storedVotedNft);
        }
      } catch (error) {
        console.error('Error checking vote status:', error);
      }
    };
    
    checkVotingStatus();
  }, [address, tournamentId]);

  // Live timer for tournament countdown
  useEffect(() => {
    if (!tournament) return;

    // Update more frequently for tournaments with short time remaining
    const shouldUpdate = shouldShowSeconds(tournament.endTime);
    const interval = shouldUpdate ? 1000 : 60000; // 1 second vs 1 minute

    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, interval);

    return () => clearInterval(timer);
  }, [tournament]);

  const handleEnterTournament = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet to enter the tournament');
      return;
    }
    
    // Show the tournament entry modal for Azur Guardian tournaments
    setShowEntryModal(true);
  };
  
  const handleEntrySuccess = async () => {
    setHasEntered(true);
    
    const lastEnteredTournament = localStorage.getItem('lastEnteredTournament');
    if (lastEnteredTournament) {
      const parsed = JSON.parse(lastEnteredTournament);
      setEntryId(parsed.entryId);
    }
    
    // Trigger confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#00F0FF', '#FF6B6B']
    });
    
    // Show success message with more details
    toast.success(
      <div>
        <p className="font-semibold">🎉 Successfully entered the tournament!</p>
        <p className="text-sm mt-1">Your NFT is now competing. Voting will begin soon!</p>
        <p className="text-xs mt-2 text-gray-400">Refreshing tournament pool...</p>
      </div>,
      { duration: 5000 }
    );
    
    // Update participant count locally
    if (tournament) {
      setTournament({
        ...tournament,
        totalParticipants: tournament.totalParticipants + 1
      });
    }
    
    // Force refresh entries with multiple attempts
    let retryCount = 0;
    const maxRetries = 10; // Increased retries
    
    const refreshWithRetry = async () => {
      try {
        
        // Use SimpleTournamentService to fetch updated entries
        const { SimpleTournamentService } = await import('@/services/simpleTournamentService');
        const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL! });
        const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID!;
        const service = new SimpleTournamentService(suiClient, PACKAGE_ID);
        
        // Get updated tournament data
        const tournamentData = await service.getTournament(tournamentId);
        if (tournamentData) {
          // Update participant count
          setTournament(prev => prev ? {
            ...prev,
            totalParticipants: tournamentData.entriesCount
          } : null);
          console.log('Updated tournament participants:', tournamentData.entriesCount);
        }
        
        // Then fetch the entries
        const entries = await service.getTournamentEntries(tournamentId);
        console.log('Fetched entries:', entries);
        
        const mappedEntries = entries.map(entry => ({
          id: entry.nftId, // Use nftId as id
          nftId: entry.nftId,
          owner: entry.submitter,
          name: `NFT ${entry.nftId.slice(0, 8)}...`,
          imageUrl: entry.imageUrl,
          votes: entry.voteCount,
          tournamentId: tournamentId
        }));
        
        if (mappedEntries.length > 0 || retryCount >= 3) { // Show entries after a few retries even if empty
          console.log('✅ Setting entries:', mappedEntries.length);
          setNftEntries(mappedEntries);
          
          // Auto-scroll to tournament pool to show the new entry
          if (mappedEntries.length > 0) {
            setTimeout(() => {
              const poolElement = document.getElementById('tournament-pool');
              if (poolElement) {
                poolElement.scrollIntoView({ behavior: 'smooth' });
              }
            }, 1000);
          }
          
          return;
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          const delay = Math.min(retryCount * 1000, 5000); // Cap at 5 seconds
          console.log(`⏳ No entries found, retrying in ${delay}ms...`);
          setTimeout(refreshWithRetry, delay);
        } else {
          console.log('⚠️ Max retries reached. Tournament entries may take time to appear.');
          // Still set empty entries to trigger UI update
          setNftEntries([]);
        }
      } catch (error) {
        console.error('Error refreshing entries:', error);
        retryCount++;
        if (retryCount < maxRetries) {
          const delay = Math.min(retryCount * 1000, 5000);
          setTimeout(refreshWithRetry, delay);
        }
      }
    };
    
    // Start the refresh process after a short delay to allow blockchain to update
    setTimeout(refreshWithRetry, 2000);
  };

  // Voting state is already declared above

  // Handle voting for NFTs using SimpleTournamentService
  const handleVote = async (nftId: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    if (!tournament) {
      toast.error('Tournament not found');
      return;
    }

    try {
      setVotingForNFT(nftId);
      
      // Import and use SimpleTournamentService for voting
      const { SimpleTournamentService } = await import('@/services/simpleTournamentService');
      const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL! });
      const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID!;
      const service = new SimpleTournamentService(suiClient, PACKAGE_ID);
      
      console.log('🗳️ Voting for NFT:', nftId, 'in tournament:', tournament.id);
      console.log('Tournament ID type:', typeof tournament.id);
      console.log('NFT ID type:', typeof nftId);
      
      // Check if user has already voted
      const userHasVoted = await service.hasUserVoted(tournament.id, address);
      if (userHasVoted) {
        console.log('⚠️ User has already voted in this tournament');
        toast.error('You have already voted in this tournament!');
        setVotingForNFT(null);
        return;
      }
      
      // Create vote transaction
      const tx = service.voteTransaction(tournament.id, nftId);
      const result = await executeTransaction(tx);
      
      console.log('Vote transaction result:', result);
      
      if (result?.effects?.status?.status === 'success') {
        console.log('✅ Vote successful!');
        console.log('Transaction digest:', result.digest);
        
        // Mark the vote time to prevent immediate refresh
        setLastVoteTime(Date.now());
        
        // Update voting state
        setHasVoted(true);
        setVotedNftId(nftId);
        
        // Store voted NFT in localStorage
        const votedNftKey = `voted_${tournament.id}_${address}`;
        localStorage.setItem(votedNftKey, nftId);
        
        // Show success animation
        setShowVoteSuccess(true);
        const votedEntry = nftEntries.find(e => e.nftId === nftId);
        setVotedNftName(votedEntry?.name || 'NFT');
        setTimeout(() => setShowVoteSuccess(false), 3000);
        
        // Update votes locally for immediate feedback
        setNftEntries(prev => prev.map(entry => {
          if (entry.nftId === nftId) {
            return {
              ...entry,
              votes: entry.votes + 1
            };
          }
          return entry;
        }));
        
        // Refresh tournament entries after voting with retry logic
        const refreshVoteCounts = async (retryCount = 0) => {
          const maxRetries = 5;
          const delay = Math.min(1000 * Math.pow(1.5, retryCount), 5000); // Exponential backoff
          
          setTimeout(async () => {
            try {
              console.log(`🔄 Refreshing vote counts (attempt ${retryCount + 1}/${maxRetries})...`);
              const entries = await service.getTournamentEntries(tournament.id);
              console.log('Raw entries from service:', entries);
              
              const updatedEntries = entries.map(entry => ({
                id: entry.nftId,
                nftId: entry.nftId,
                owner: entry.submitter,
                name: `NFT ${entry.nftId.slice(0, 8)}...`,
                imageUrl: entry.imageUrl,
                votes: entry.voteCount,
                tournamentId: tournament.id
              }));
              
              console.log('Mapped entries with votes:', updatedEntries.map(e => ({ nftId: e.nftId, votes: e.votes })));
              
              // Check if vote was actually recorded
              const votedEntry = updatedEntries.find(e => e.nftId === nftId);
              const oldEntry = nftEntries.find(e => e.nftId === nftId);
              
              if (votedEntry && oldEntry && votedEntry.votes === oldEntry.votes && retryCount < maxRetries - 1) {
                console.log('⏳ Vote count not updated yet, retrying...');
                refreshVoteCounts(retryCount + 1);
                return;
              }
              
              console.log('✅ Vote counts updated successfully');
              setNftEntries(updatedEntries);
            } catch (error) {
              console.error('Error refreshing entries after vote:', error);
              if (retryCount < maxRetries - 1) {
                refreshVoteCounts(retryCount + 1);
              }
            }
          }, delay);
        };
        
        // Start the refresh process
        refreshVoteCounts();
        
        toast.success('Vote submitted successfully!');
      } else {
        toast.error('Failed to vote');
      }
    } catch (error: any) {
      console.error('❌ Error voting:', error);
      if (error.message?.includes('EAlreadyVoted')) {
        toast.error('You have already voted in this tournament.');
      } else {
        toast.error(error.message || 'Failed to vote');
      }
    } finally {
      setVotingForNFT(null);
    }
  };

  // Handle tournament finalization
  const handleFinalizeTournament = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet to finalize the tournament');
      return;
    }

    if (!tournament) {
      toast.error('Tournament not found');
      return;
    }

    try {
      setIsFinalizingTournament(true);
      // Show loading toast
      const loadingToast = toast.loading('Finalizing tournament and distributing prizes...');
      
      // Import and use SimpleTournamentService
      const { SimpleTournamentService } = await import('@/services/simpleTournamentService');
      const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL! });
      const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID!;
      const service = new SimpleTournamentService(suiClient, PACKAGE_ID);
      
      // Create end tournament transaction
      const tx = service.endTournamentTransaction(tournament.id);
      const result = await executeTransaction(tx);
      
      console.log('End tournament result:', result);
      
      if (result?.effects?.status?.status === 'success') {
        toast.dismiss(loadingToast);
        toast.success('Tournament finalized! Prizes have been distributed to winners.');
        
        // Trigger confetti for celebration
        confetti({
          particleCount: 200,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#C0C0C0', '#CD7F32'] // Gold, Silver, Bronze
        });
        
        // Update tournament status to ended
        setTournament({
          ...tournament,
          status: 2 // Set status to ended
        });
        
        // Refresh tournament data after a delay
        setTimeout(async () => {
          window.location.reload();
        }, 3000);
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to finalize tournament');
      }
    } catch (error: any) {
      console.error('Error finalizing tournament:', error);
      toast.error(error.message || 'Failed to finalize tournament');
    } finally {
      setIsFinalizingTournament(false);
    }
  };

  const formatTimeRemaining = (endTime: number) => {
    const formattedTime = formatRemainingTime(endTime);
    return formattedTime === 'Ended' ? 'Ended' : `${formattedTime} remaining`;
  };

  const getTournamentTypeLabel = () => {
    switch (tournament?.tournamentType) {
      case 1: return 'Daily Tournament';
      case 2: return 'Weekly Tournament';
      case 3: return 'Monthly Tournament';
      default: return 'Tournament';
    }
  };

  const getStatusColor = () => {
    switch (tournament?.status) {
      case 0: return 'bg-blue-600 text-white';
      case 1: return 'bg-green-600 text-white';
      case 2: return 'bg-gray-600 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusLabel = () => {
    switch (tournament?.status) {
      case 0: return 'Registration Open';
      case 1: return 'Active';
      case 2: return 'Ended';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{backgroundColor: 'var(--bg-dark)'}}>
        <Navbar />
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-24">
          <div className="space-y-8">
            <div className="h-8 bg-gray-800 w-1/3 skeleton-loading"></div>
            <div className="h-96 bg-gray-900 border border-gray-800 skeleton-loading"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-900 border border-gray-800 skeleton-loading"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-900 border border-gray-800 skeleton-loading"></div>
                <div className="h-48 bg-gray-900 border border-gray-800 skeleton-loading"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen" style={{backgroundColor: 'var(--bg-dark)'}}>
        <Navbar />
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-24">
          <motion.div 
            className="text-center py-32"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div 
              className="text-6xl mb-4 opacity-20"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >⚔️</motion.div>
            <h1 className="text-3xl font-bold text-white mb-4 uppercase tracking-wider">Tournament Not Found</h1>
            <p className="text-gray-400 mb-8">The tournament you're looking for doesn't exist or has been removed.</p>
            <Link 
              href="/tournaments" 
              className="inline-flex items-center px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all uppercase tracking-wider button-press"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tournaments
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-dark)'}}>
      <Navbar />
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-20 sm:pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/tournaments" 
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            <span className="uppercase tracking-wider text-sm font-medium">Back</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
              tournament.status === 1 ? 'bg-green-500 text-black' : 
              tournament.status === 2 ? 'bg-gray-700 text-gray-300' : 
              'bg-blue-500 text-white'
            }`}>
              {getStatusLabel()}
            </span>
          </div>
        </div>

        {/* Tournament Hero */}
        <div className="relative bg-black border border-gray-800 overflow-hidden mb-6 sm:mb-8 md:mb-12 hero-geometric group">
          <div className="relative h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-0 group-hover:opacity-40 blur-3xl transition-all duration-700 scale-110 -z-10"></div>
            
            {/* Background Image with darker overlay */}
            <div 
              className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
              style={{
                backgroundImage: `url('${tournament.bannerImage || `/images/${Math.floor(Math.random() * 5) + 1}.png`}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            
            {/* Inner Glow Shadow */}
            <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(99,102,241,0)] group-hover:shadow-[inset_0_0_120px_rgba(99,102,241,0.3)] transition-all duration-700 z-10"></div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
            
            {/* Geometric Accents - Handled by CSS now */}
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 uppercase tracking-tight leading-tight">{tournament.name}</h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-xl text-gray-300 mb-3 sm:mb-4 md:mb-6 lg:mb-8 max-w-3xl normal-case line-clamp-2 sm:line-clamp-none">{tournament.description}</p>
              
              {/* Stats Grid - Improved mobile layout */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                <div className="stat-card border border-gray-800 bg-black/70 backdrop-blur-sm p-4 sm:p-5 hover-lift transition-all duration-300">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 font-mono" style={{color: 'var(--accent-gold)'}}>
                    {((parseInt(tournament.prizePool || '0')) / 1_000_000_000).toFixed(2)}
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider">SUI Prize Pool</div>
                </div>
                
                <div className="stat-card border border-gray-800 bg-black/70 backdrop-blur-sm p-4 sm:p-5 hover-lift transition-all duration-300">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 font-mono">
                    {tournament.totalParticipants}
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider">Participants</div>
                </div>
                
                <div className="stat-card border border-gray-800 bg-black/70 backdrop-blur-sm p-4 sm:p-5 hover-lift transition-all duration-300">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 font-mono">
                    {((parseInt(tournament.entryFee || '0')) / 1_000_000_000).toFixed(3)}
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider">Entry Fee (SUI)</div>
                </div>
                
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="stat-card border border-gray-800 bg-black/70 backdrop-blur-sm p-4 sm:p-5 hover-lift transition-all duration-300">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 font-mono" style={{color: 'var(--accent-electric)'}}>
                    <motion.span
                      key={timeRemaining}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {timeRemaining.split(' ')[0] || '---'}
                    </motion.span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider">Time Left</div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column - Voting Arena */}
          <motion.div 
            className="xl:col-span-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div id="voting" className="bg-black border border-gray-800 p-4 sm:p-6 md:p-8 transition-all duration-300 hover:border-gray-700">
              {/* NFT Voting Gallery */}
              {tournament.status === 1 ? (
                nftEntries.length < 2 ? (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-4">⏳</div>
                    <h3 className="text-xl font-bold text-white mb-2 uppercase">Waiting for More Participants</h3>
                    <p className="text-gray-400">Need at least 2 participants to start voting.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Current participants: {nftEntries.length}
                    </p>
                  </div>
                ) : (
                  <NFTVotingGallery
                    entries={nftEntries.map(entry => ({
                      nft_id: entry.nftId,
                      submitter: entry.owner,
                      image_url: entry.imageUrl,
                      vote_count: entry.votes
                    }))}
                    onVote={handleVote}
                    hasVoted={hasVoted}
                    votedNftId={votedNftId}
                    tournamentId={tournamentId}
                    isVoting={votingForNFT !== null}
                  />
                )
              ) : tournament.status === 2 ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🏁</div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 uppercase">Tournament Ended</h3>
                    <p className="text-sm sm:text-base text-gray-400 px-4 sm:px-0">
                      {isFinalized ? 'The voting has concluded and prizes have been distributed!' : 'The voting has concluded!'}
                    </p>
                    
                    {/* Show finalize button if tournament ended but not finalized */}
                    {!isFinalized && nftEntries.length >= 5 && (
                      <button
                        onClick={handleFinalizeTournament}
                        disabled={isFinalizingTournament}
                        className="mt-6 px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold text-lg rounded-full
                                 hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 transform hover:-translate-y-1
                                 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                                 shadow-lg hover:shadow-xl uppercase tracking-wider"
                      >
                        {isFinalizingTournament ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                            />
                            Finalizing...
                          </span>
                        ) : (
                          '🏆 Finalize Tournament & Distribute Prizes'
                        )}
                      </button>
                    )}
                    
                    {/* Show message if not enough participants */}
                    {!isFinalized && nftEntries.length < 5 && (
                      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg max-w-md mx-auto">
                        <p className="text-yellow-500 text-sm">
                          Tournament had less than 5 participants. Finalize to refund all entry fees.
                        </p>
                        <button
                          onClick={handleFinalizeTournament}
                          disabled={isFinalizingTournament}
                          className="mt-3 px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg
                                   hover:bg-yellow-400 transition-colors duration-200
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isFinalizingTournament ? 'Processing Refunds...' : 'Process Refunds'}
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Show final results */}
                  <NFTVotingGallery
                    entries={nftEntries.map(entry => ({
                      nft_id: entry.nftId,
                      submitter: entry.owner,
                      image_url: entry.imageUrl,
                      vote_count: entry.votes
                    }))}
                    onVote={handleVote}
                    hasVoted={true}
                    votedNftId={votedNftId}
                    tournamentId={tournamentId}
                    isVoting={false}
                  />
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">⏳</div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase">Registration Phase</h3>
                  <p className="text-gray-400">Waiting for enough participants to start the tournament.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {nftEntries.length} / 5 minimum participants
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Entry & Stats */}
          <motion.div 
            className="xl:col-span-4 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Entry Section */}
            <div id="entry" className="bg-black border border-gray-800 p-6 transition-all duration-300 hover:border-gray-700" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(26, 26, 26, 0.95))'}}>
              <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Tournament Entry</h3>
              
              {hasEntered && entryId ? (
                <div className="bg-green-500/10 border border-green-500/30 p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-green-500 font-bold uppercase text-sm">Entry Confirmed</p>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Your NFT is competing in this tournament.
                  </p>
                  
                  <ShareTournamentEntry 
                    tournamentId={tournamentId}
                    entryId={entryId}
                    tournamentName={tournament.name}
                  />
                  
                  <button
                    onClick={() => {
                      setHasEntered(false);
                      setEntryId('');
                      localStorage.removeItem('lastEnteredTournament');
                    }}
                    className="mt-3 text-xs text-gray-400 hover:text-gray-300 underline"
                  >
                    Not correct? Reset entry status
                  </button>
                </div>
              ) : tournament.status === 2 ? (
                <div className="bg-gray-900/50 border border-gray-800 p-4 text-center">
                  <p className="text-gray-400 font-medium uppercase">Tournament Ended</p>
                  <p className="text-gray-400 text-sm mt-1">
                    This tournament is no longer accepting entries
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleEnterTournament}
                  disabled={!isConnected || tournament.status === 2}
                  className={`w-full py-4 px-4 font-bold transition-all uppercase tracking-wider button-press ${
                    !isConnected
                      ? 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800'
                      : tournament.status === 2
                      ? 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800'
                      : 'bg-white text-black hover:bg-gray-200 rounded-full transform hover:-translate-y-1'
                  }`}
                >
                  {!isConnected
                    ? 'Connect Wallet'
                    : tournament.status === 2
                    ? 'Tournament Ended'
                    : `Enter Battle → ${((parseInt(tournament.entryFee || '0')) / 1_000_000_000).toFixed(3)} SUI`}
                </button>
              )}

              {/* Azur Guardian exclusive badge */}
              <div className="mt-4 p-3 bg-gray-900/50 border border-gray-800">
                <p className="text-white text-sm font-bold uppercase">
                  🛡️ Azur Guardian Exclusive
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Only Azur Guardian NFT holders can participate
                </p>
              </div>

              {!isConnected && tournament.status !== 2 && (
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Connect your wallet to participate
                </p>
              )}
            </div>

            {/* Match Schedule */}
            <div id="match-schedule" className="space-y-6">
              {/* Voting Stats */}
              <div className="bg-black border border-gray-800 p-6 transition-all duration-300 hover:border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
                  Voting Progress
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Votes Cast</span>
                    <span className="text-xl font-bold text-white">
                      {nftEntries.reduce((sum, entry) => sum + entry.votes, 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Participants</span>
                    <span className="text-xl font-bold text-white">{nftEntries.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Your Status</span>
                    <span className={`text-sm font-bold uppercase ${
                      hasVoted ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                      {hasVoted ? 'Voted ✓' : 'Not Voted'}
                    </span>
                  </div>
                  
                  {tournament.status === 1 && (
                    <div className="pt-4 border-t border-gray-800">
                      <p className="text-xs text-gray-500 text-center">
                        One vote per wallet • Votes are final
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tournament Stats */}
              <div className="bg-black border border-gray-800 p-6 transition-all duration-300 hover:border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
                  Tournament Stats
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm uppercase">Total Participants</span>
                    <span className="text-white font-bold">{nftEntries.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm uppercase">Leading NFT</span>
                    <span className="text-white font-bold">
                      {nftEntries.length > 0 
                        ? nftEntries.sort((a, b) => b.votes - a.votes)[0].votes + ' votes'
                        : 'None'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm uppercase">Avg Votes per NFT</span>
                    <span className="text-white font-bold">
                      {nftEntries.length > 0 
                        ? (nftEntries.reduce((sum, entry) => sum + entry.votes, 0) / nftEntries.length).toFixed(1)
                        : '0'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm uppercase">Total Votes</span>
                    <span className="text-white font-bold">
                      {nftEntries.reduce((sum, entry) => sum + entry.votes, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prize Distribution */}
            <div className="bg-black border border-gray-800 p-6 transition-all duration-300 hover:border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Prize Distribution</h3>
              
              <div className="space-y-4">
                {tournament.totalParticipants < 5 ? (
                  <div className="bg-gray-900/50 border border-gray-800 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 uppercase text-sm">Winner Takes All</span>
                      <span className="font-bold text-white text-2xl font-mono">100%</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-900/50 border border-gray-800 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center" style={{background: 'var(--gradient-gold)'}}>
                            <span className="text-black font-bold text-sm">1</span>
                          </div>
                          <span className="text-gray-400 uppercase text-sm">First Place</span>
                        </div>
                        <span className="font-bold text-2xl font-mono rank-first">60%</span>
                      </div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-400 flex items-center justify-center">
                            <span className="text-black font-bold text-sm">2</span>
                          </div>
                          <span className="text-gray-400 uppercase text-sm">Second Place</span>
                        </div>
                        <span className="font-bold text-2xl font-mono rank-second">30%</span>
                      </div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center" style={{backgroundColor: '#CD7F32'}}>
                            <span className="text-black font-bold text-sm">3</span>
                          </div>
                          <span className="text-gray-400 uppercase text-sm">Third Place</span>
                        </div>
                        <span className="font-bold text-2xl font-mono rank-third">10%</span>
                      </div>
                    </div>
                  </>
                )}
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs uppercase">Total Prize Pool</span>
                    <span className="text-white font-bold font-mono" style={{color: 'var(--accent-gold)'}}>{((parseInt(tournament.prizePool || '0')) / 1_000_000_000).toFixed(2)} SUI</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Modals */}
      
      <NFTSelectionModal
        isOpen={isNFTModalOpen}
        onClose={() => setIsNFTModalOpen(false)}
        tournamentId={tournamentId}
        entryFee={((parseInt(tournament.entryFee || '0')) / 1_000_000_000).toFixed(3)}
        onSuccess={handleEntrySuccess}
      />
      
      {tournament && (
        <TournamentEntryModal
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          tournament={{
            id: tournamentId,
            name: tournament.name,
            entry_fee: tournament.entryFee,
            is_azur_guardian_exclusive: true // All tournaments are now Azur Guardian exclusive
          }}
          onSuccess={handleEntrySuccess}
        />
      )}
      
      {/* Vote Success Animation */}
      <VoteSuccessAnimation 
        show={showVoteSuccess} 
        nftName={votedNftName}
      />
    </div>
  );
}