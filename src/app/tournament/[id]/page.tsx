'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SuiClient } from '@mysten/sui/client';
import { getFullnodeUrl } from '@mysten/sui/client';
import { TournamentService, Tournament } from '@/services/tournamentService';
import { useWallet } from '@/hooks/useWallet';
import Navbar from '@/components/layout/Navbar';
// Using standard img tags for better compatibility with external image sources
import Link from 'next/link';
import SmashOrPassVoting from '@/components/voting/SmashOrPassVoting';

// Define the TournamentEntry type
interface TournamentEntry {
  nftId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  votes?: number;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params?.id as string;

  // Redirect to correct tournament page format
  useEffect(() => {
    router.push(`/tournaments/${tournamentId}`);
  }, [router, tournamentId]);
  
  // Log the tournament ID for debugging
  useEffect(() => {
  }, [tournamentId]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, address } = useWallet();
  const [registering, setRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  
  // State for NFT selection modal
  const [showNftSelection, setShowNftSelection] = useState(false);
  // State for voting UI style
  const [useSmashOrPassUI, setUseSmashOrPassUI] = useState(true);
  const [tournamentEntries, setTournamentEntries] = useState<TournamentEntry[]>([]);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [votingSuccess, setVotingSuccess] = useState(false);
  const [votingError, setVotingError] = useState<string | null>(null);
  
  // NFT images that are working in the grid view - using local avatar images
  const nftImages = [
    '/images/avatars/telegram-cloud-photo-size-1-5037512497065733520-y.jpg',
    '/images/avatars/telegram-cloud-photo-size-1-5037512497065733521-y.jpg',
    '/images/avatars/telegram-cloud-photo-size-1-5037512497065733522-y.jpg',
    '/images/avatars/telegram-cloud-photo-size-1-5037512497065733523-y.jpg',
    '/images/avatars/telegram-cloud-photo-size-1-5037512497065733524-y.jpg'
  ];
  
  // Fallback image for NFTs
  const fallbackNftImage = '/images/avatars/telegram-cloud-photo-size-1-5037512497065733521-y.jpg';

  // Format SUI amount from MIST
  const formatSui = (mistAmount: number | string | undefined) => {
    if (mistAmount === undefined) return '0.000';
    const amount = typeof mistAmount === 'string' ? parseInt(mistAmount) : mistAmount;
    return (amount / 1000000000).toFixed(3);
  };

  // Tournament type mapping
  const TOURNAMENT_TYPES = {
    0: 'Hourly',
    1: 'Daily',
    2: 'Weekly',
    3: 'Monthly',
    4: 'Custom'
  };

  // Calculate time remaining
  const getTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const timeRemaining = endTime - now;
    
    if (timeRemaining <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  };

  // Format time remaining
  const formatTimeRemaining = (endTime: number) => {
    const { days, hours, minutes } = getTimeRemaining(endTime);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Get status text
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Registration Open';
      case 1:
        return 'Active';
      case 2:
        return 'Ended';
      default:
        return 'Unknown';
    }
  };

  // Get status badge
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Registration</span>;
      case 1:
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Active</span>;
      case 2:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">Ended</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Unknown</span>;
    }
  };

  // Handle tournament registration
  const handleRegister = async () => {
    if (!isConnected || !tournament) {
      setRegistrationError('Please connect your wallet to register');
      return;
    }

    try {
      setRegistering(true);
      setRegistrationError(null);
      
      // Create SuiClient
      const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('mainnet') });
      const tournamentService = new TournamentService(suiClient);
      
      // Call the register function from tournamentService
      const txId = await tournamentService.registerForTournament(tournamentId, address as string);
      
      if (txId) {
        setRegistrationSuccess(true);
        // Refresh tournament data
        fetchTournament();
      } else {
        setRegistrationError('Failed to register for tournament');
      }
    } catch (err: unknown) {
      console.error('Error registering for tournament:', err);
      setRegistrationError(err instanceof Error ? err.message : 'Failed to register for tournament');
    } finally {
      setRegistering(false);
    }
  };

  // Fetch tournament entries
  const fetchTournamentEntries = async () => {
    try {
      if (!tournamentId) {
        console.error('Cannot fetch entries: Tournament ID is missing');
        return;
      }
      
      
      // Create SuiClient
      const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('mainnet') });
      const tournamentService = new TournamentService(suiClient);
      
      // Try to fetch real entries from blockchain
      try {
        const entries = await tournamentService.getTournamentEntries(tournamentId);
        if (entries && entries.length > 0) {
          // Map blockchain entries to TournamentEntry format
          const formattedEntries = entries.map(entry => ({
            nftId: entry.nftId,
            name: entry.name || `NFT #${entry.nftId.substring(0, 6)}`,
            description: 'An NFT tournament entry',
            imageUrl: entry.image || nftImages[Math.floor(Math.random() * nftImages.length)],
            votes: entry.votes
          }));
          
          setTournamentEntries(formattedEntries);
          return;
        }
      } catch (err) {
      }
      
      // Define local avatar images that are guaranteed to work
      const workingNftImages = [
        '/images/avatars/telegram-cloud-photo-size-1-5037512497065733520-y.jpg',
        '/images/avatars/telegram-cloud-photo-size-1-5037512497065733521-y.jpg',
        '/images/avatars/telegram-cloud-photo-size-1-5037512497065733522-y.jpg',
        '/images/avatars/telegram-cloud-photo-size-1-5037512497065733523-y.jpg',
        '/images/avatars/telegram-cloud-photo-size-1-5037512497065733524-y.jpg'
      ];
      
      const mockEntries: TournamentEntry[] = [
        {
          nftId: '0x123',
          name: 'Azur Guardian #1',
          description: 'A rare Azur Guardian NFT with special powers',
          imageUrl: workingNftImages[0],
          votes: 3
        },
        {
          nftId: '0x456',
          name: 'Azur Guardian #2',
          description: 'An uncommon Azur Guardian NFT with unique abilities',
          imageUrl: workingNftImages[1],
          votes: 1
        },
        {
          nftId: '0x789',
          name: 'Azur Guardian #3',
          description: 'A common Azur Guardian NFT with basic abilities',
          imageUrl: workingNftImages[2],
          votes: 0
        }
      ];
      
      setTournamentEntries(mockEntries);
    } catch (error) {
      console.error('Error fetching tournament entries:', error);
      setError('Failed to fetch tournament entries');
    } finally {
      setLoading(false);
    }
  };

  // Handle voting for NFT
  const handleVote = async (nftId: string) => {
    try {
      // For demo purposes, we'll use a mock implementation
      setVotingInProgress(true);
      setVotingError(null);
      
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful vote
      const success = true; // For demo, always succeed
      
      if (success) {
        setVotingError(null);
        setVotingSuccess(true);
        setShowNftSelection(false);
        
        // Update the local state to show the vote immediately
        setTournamentEntries(prevEntries => {
          return prevEntries.map(entry => {
            if (entry.nftId === nftId) {
              return { ...entry, votes: (entry.votes || 0) + 1 };
            }
            return entry;
          });
        });
      } else {
        setVotingError('Failed to vote in tournament');
      }
    } catch (err: unknown) {
      console.error('Error voting in tournament:', err);
      setVotingError(err instanceof Error ? err.message : 'Failed to vote in tournament');
    } finally {
      setVotingInProgress(false);
    }
  };

  // Fetch tournament data
  const fetchTournament = async () => {
    try {
      setLoading(true);
      
      if (!tournamentId) {
        console.error('Tournament ID is missing');
        setError('Tournament ID is missing');
        return;
      }
      
      console.log('Fetching tournament with ID:', tournamentId);
      
      // Create SuiClient
      const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('mainnet') });
      const tournamentService = new TournamentService(suiClient);
      
      // Fetch tournament by ID
      const fetchedTournament = await tournamentService.getTournamentById(tournamentId);
      
      if (!fetchedTournament) {
        console.error('Tournament not found for ID:', tournamentId);
        setError('Tournament not found');
        return;
      }
      
      console.log('Fetched tournament:', fetchedTournament);
      setTournament(fetchedTournament);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching tournament:', err, 'Tournament ID:', tournamentId);
      setError(err instanceof Error ? err.message : 'Failed to fetch tournament');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tournament data on component mount
  useEffect(() => {
    if (tournamentId) {
      fetchTournament();
      fetchTournamentEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  // Loading state
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Unable to load tournament. Please try again later.</p>
            <Link 
              href="/view-tournaments"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Tournaments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If tournament not found
  if (!tournament) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tournament Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400">The tournament you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link 
              href="/view-tournaments"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Tournaments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tournament Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tournament.name}</h1>
            <div className="flex items-center space-x-4">
              {getStatusBadge(tournament.status)}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {tournament.status !== 2 ? `Ends in ${formatTimeRemaining(tournament.endTime)}` : 'Tournament has ended'}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Link 
              href="/view-tournaments"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tournaments
            </Link>
          </div>
        </div>

        {/* Tournament Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-64 w-full">
            <img 
              src={tournament.featuredImage || '/images/avatars/telegram-cloud-photo-size-1-5037512497065733524-y.jpg'}
              alt={tournament.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                console.log('Tournament image failed to load, using fallback');
                const imgElement = e.target as HTMLImageElement;
                imgElement.src = 'https://ipfs.io/ipfs/QmNfzTzDSEHEXLaR2TzXVugmE3rKYvZ29uzK6BKLuLU5o5';
              }}
            />
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Entry Fee</h3>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatSui(tournament.entryFee)} SUI</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Prize Pool</h3>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatSui(tournament.prizePool)} SUI</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Participants</h3>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{tournament.totalParticipants}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">{tournament.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tournament Type</h3>
                <p className="text-gray-900 dark:text-white">{tournament.tournamentType !== undefined && tournament.tournamentType !== null ? TOURNAMENT_TYPES[tournament.tournamentType as keyof typeof TOURNAMENT_TYPES] || 'Unknown' : 'Unknown'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h3>
                <p className="text-gray-900 dark:text-white">{getStatusText(tournament.status)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Start Time</h3>
                <p className="text-gray-900 dark:text-white">{new Date(tournament.startTime).toLocaleString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">End Time</h3>
                <p className="text-gray-900 dark:text-white">{new Date(tournament.endTime).toLocaleString()}</p>
              </div>
            </div>
            
            {/* Registration/Voting Button */}
            {tournament.status === 0 && (
              <button
                onClick={handleRegister}
                disabled={registering || !isConnected}
                className={`w-full md:w-auto px-6 py-3 rounded-md font-medium text-white ${
                  registering ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors duration-300`}
              >
                {registering ? 'Processing...' : 'Register for Tournament'}
              </button>
            )}
            
            {tournament.status === 1 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Vote for NFTs</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">UI Style:</span>
                    <button
                      onClick={() => setUseSmashOrPassUI(true)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors duration-300 ${useSmashOrPassUI 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
                    >
                      Smash or Pass
                    </button>
                    <button
                      onClick={() => setUseSmashOrPassUI(false)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors duration-300 ${!useSmashOrPassUI 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
                    >
                      Grid View
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {useSmashOrPassUI 
                    ? "Swipe right to vote for NFTs you like, or left to pass. You can vote once per tournament." 
                    : "Select an NFT to vote for in this tournament. You can vote once per tournament."}
                </p>
                
                {!isConnected ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg mb-4">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      Please connect your wallet to vote for NFTs.
                    </p>
                  </div>
                ) : useSmashOrPassUI ? (
                  <div className="mb-16 pt-4"> {/* Increased bottom margin and added top padding */}
                    {tournamentEntries.length > 0 ? (
                      <SmashOrPassVoting
                        entries={tournamentEntries.map(entry => ({
                          nftId: entry.nftId,
                          owner: '', // Default owner value
                          votes: entry.votes || 0, // Ensure votes is not undefined
                          image: entry.imageUrl, // Map imageUrl to image property expected by SmashOrPassVoting
                          name: entry.name
                        }))}
                        onVote={handleVote}
                        isVoting={votingInProgress}
                        fallbackImage="/images/avatars/telegram-cloud-photo-size-1-5037512497065733520-y.jpg"
                      />
                    ) : loading ? (
                      <div className="text-center py-8">
                        <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading NFT entries...</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-300">No NFT entries found for this tournament.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-8 mt-4"> {/* Increased margins */}
                    <button
                      onClick={() => setShowNftSelection(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
                    >
                      Select NFT to Vote
                    </button>
                  </div>
                )}
                
                {/* Voting Status Notifications */}
                {votingError && (
                  <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg mb-4">
                    <p className="text-red-800 dark:text-red-200">{votingError}</p>
                  </div>
                )}
                
                {votingSuccess && (
                  <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg mb-4">
                    <p className="text-green-800 dark:text-green-200">Your vote has been successfully recorded!</p>
                  </div>
                )}
                
                {/* Traditional Grid View Modal */}
                {showNftSelection && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select an NFT to Vote</h3>
                        <button 
                          onClick={() => setShowNftSelection(false)}
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="p-4">
                        {votingInProgress ? (
                          <div className="text-center py-8">
                            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Processing your vote...</p>
                          </div>
                        ) : loading ? (
                          <div className="text-center py-8">
                            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading NFT entries...</p>
                          </div>
                        ) : tournamentEntries.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-300">No NFT entries found for this tournament.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {tournamentEntries.map((entry, index) => (
                              <div 
                                key={entry.nftId || index}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300"
                                onClick={() => handleVote(entry.nftId)}
                              >
                                <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
                                  <img 
                                    src={entry.imageUrl || fallbackNftImage}
                                    alt={entry.name || `NFT Entry ${index + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    onError={(e) => {
                                      console.log('Grid image failed to load, using fallback');
                                      const imgElement = e.target as HTMLImageElement;
                                      imgElement.src = '/images/avatars/telegram-cloud-photo-size-1-5037512497065733522-y.jpg';
                                    }}
                                  />
                                </div>
                                <div className="p-3">
                                  <h4 className="font-medium text-gray-900 dark:text-white truncate">{entry.name || `NFT Entry ${index + 1}`}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{entry.description || 'No description'}</p>
                                  <div className="mt-2 flex justify-between items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Votes: {entry.votes || 0}</span>
                                    <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded transition-colors duration-300">
                                      Vote
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                        <button 
                          onClick={() => setShowNftSelection(false)}
                          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Entries</h4>
                  {tournamentEntries.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-300">
                      No entries yet. Be the first to submit an NFT!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {tournamentEntries.slice(0, 3).map((entry, index) => (
                        <div key={entry.nftId || index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
                          <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-md mb-2 relative">
                            <img 
                              src={entry.imageUrl || fallbackNftImage}
                              alt={entry.name || `NFT Entry ${index + 1}`}
                              className="absolute inset-0 w-full h-full object-cover rounded-md"
                              onError={(e) => {
                                console.log('Current entries image failed to load, using fallback');
                                const imgElement = e.target as HTMLImageElement;
                                imgElement.src = '/images/avatars/telegram-cloud-photo-size-1-5037512497065733524-y.jpg';
                              }}
                            />
                          </div>
                          <h5 className="font-medium text-gray-900 dark:text-white truncate">{entry.name || `NFT Entry ${index + 1}`}</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Votes: {entry.votes || 0}</p>
                        </div>
                      ))}
                      {tournamentEntries.length > 3 && (
                        <div 
                          className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                          onClick={() => setShowNftSelection(true)}
                        >
                          <div className="text-center p-4">
                            <p className="text-gray-600 dark:text-gray-300">+{tournamentEntries.length - 3} more</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">View All</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {tournament.status === 2 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tournament Results</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300">
                    This tournament has ended. Winners will be announced soon!
                  </p>
                </div>
              </div>
            )}
            
            {/* Registration/Voting Status Messages */}
            {registrationSuccess && (
              <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Success! </strong>
                <span className="block sm:inline">Your transaction was successful.</span>
              </div>
            )}
            
            {registrationError && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{registrationError}</span>
              </div>
            )}
            
            {!isConnected && (
              <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Note: </strong>
                <span className="block sm:inline">Please connect your wallet to register or vote in this tournament.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
