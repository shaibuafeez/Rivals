/* eslint-disable @typescript-eslint/no-explicit-any */
// Import the real TransactionBlock
import { TransactionBlock } from '@mysten/sui.js/transactions';

// Simple type definition to avoid import issues
interface SuiClient {
  getObject?: (objectId: string) => Promise<any>;
  executeTransactionBlock?: (tx: any) => Promise<any>;
}

// Package IDs for development
const PACKAGE_IDS = {
  TOURNAMENT_PACKAGE_ID: process.env.NEXT_PUBLIC_TOURNAMENT_PACKAGE_ID || '0x0',
  TOURNAMENT_REGISTRY_ID: process.env.NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID || '0x0',
  WALRUS_PACKAGE_ID: process.env.NEXT_PUBLIC_WALRUS_PACKAGE_ID || '0x0',
};

// Get package IDs from environment configuration
const TOURNAMENT_PACKAGE_ID = PACKAGE_IDS.TOURNAMENT_PACKAGE_ID;
const TOURNAMENT_REGISTRY_ID = PACKAGE_IDS.TOURNAMENT_REGISTRY_ID;

export interface Tournament {
  id: string;
  name: string;
  description: string;
  tournamentType: number; // 1: Daily, 2: Weekly, 3: Monthly
  status: number; // 0: Registration, 1: Active, 2: Ended
  startTime: number;
  endTime: number;
  entryFee: string;
  totalParticipants: number;
  minParticipants?: number; // Minimum participants needed to start
  registrationEndTime?: number; // When registration phase ends
  allowedCollections?: string[]; // Collection IDs that can participate
  isTokenGated?: boolean; // Whether tournament is restricted to specific NFT holders
  timeRemaining?: number; // Time remaining in seconds
  prizePool?: string; // Total prize pool in SUI
  bannerImage?: string; // URL to banner image
  rules?: string; // Tournament rules
  featuredImage?: string; // URL to featured image for cards
  creatorAddress?: string; // Address of tournament creator
  winners?: TournamentWinner[]; // List of tournament winners
}

export interface NFTEntry {
  nftId: string;
  owner: string;
  votes: number;
  rank?: number; // Position in the tournament
}

export interface TournamentWinner {
  nftId: string;
  owner: string;
  rank: number; // 1st, 2nd, or 3rd place
  prize: string; // Amount of SUI won
  image?: string; // URL to NFT image
}

export class TournamentService {
  constructor(private suiClient: SuiClient) {}
  
  // Prize distribution percentages for tournaments with 5+ participants
  private readonly PRIZE_DISTRIBUTION = {
    FIRST_PLACE: 0.6, // 60% of prize pool
    SECOND_PLACE: 0.3, // 30% of prize pool
    THIRD_PLACE: 0.1, // 10% of prize pool
  };

  async getTournaments(): Promise<Tournament[]> {
    // In a real implementation, this would fetch tournaments from the blockchain
    // For now, we'll return mock data showcasing different tournament types
    const now = Date.now();
    const hour = 3600000; // 1 hour in milliseconds
    const day = 24 * hour; // 1 day in milliseconds
    
    return [
      {
        id: '0x123',
        name: 'Machines vs Enforcers',
        description: 'The ultimate showdown between Machines and Enforcers collections!',
        tournamentType: 2, // Weekly
        status: 0, // Registration phase
        startTime: now + 2 * day, // Starts in 2 days
        endTime: now + 9 * day, // Ends in 9 days
        entryFee: '0.05',
        totalParticipants: 42,
        registrationEndTime: now + 2 * day, // Registration ends when tournament starts
        minParticipants: 50, // Need 50 participants to start
        allowedCollections: ['0xMachines', '0xEnforcers'], // Only these collections can participate
        isTokenGated: false,
        timeRemaining: 7 * 24 * 60 * 60, // 7 days in seconds
        prizePool: '500',
        bannerImage: '/images/tournament-banner-machines.jpg',
        featuredImage: '/images/featured-machines.jpg',
        creatorAddress: '0x7a12...8f9d',
        rules: 'Submit your best NFT from either the Machines or Enforcers collection. Voting will determine the winner. No inappropriate content allowed.',
      },
      {
        id: '0x456',
        name: 'Puggies vs Fuddies',
        description: 'Puggies and Fuddies battle it out for supremacy!',
        tournamentType: 1, // Daily
        status: 0, // Registration phase
        startTime: now + 6 * hour, // Starts in 6 hours
        endTime: now + 30 * hour, // Ends in 30 hours
        entryFee: '0.01',
        totalParticipants: 28,
        registrationEndTime: now + 6 * hour, // Registration ends when tournament starts
        allowedCollections: ['0xPuggies', '0xFuddies'], // Only these collections can participate
        isTokenGated: false,
        timeRemaining: 24 * 60 * 60, // 24 hours in seconds
        prizePool: '100',
        bannerImage: '/images/tournament-banner-puggies.jpg',
        featuredImage: '/images/featured-puggies.jpg',
        creatorAddress: '0x3b45...2e7c',
        rules: 'Daily tournament for Puggies and Fuddies NFTs. One entry per wallet. Community voting will determine the winners.',
      },
      {
        id: '0x789',
        name: 'Free For All Tournament',
        description: 'All NFTs welcome! Compete for glory and prizes in this open tournament.',
        tournamentType: 2, // Weekly
        status: 1, // Active
        startTime: now - day, // Started 1 day ago
        endTime: now + 6 * day, // Ends in 6 days
        entryFee: '0.05',
        totalParticipants: 156,
        isTokenGated: false,
        timeRemaining: 6 * 24 * 60 * 60, // 6 days in seconds
        prizePool: '750',
        bannerImage: '/images/tournament-banner-ffa.jpg',
        featuredImage: '/images/featured-ffa.jpg',
        creatorAddress: '0x9d78...4a1b',
        rules: 'Open to all NFT collections. Each wallet can submit up to 3 different NFTs. Voting ends when the timer reaches zero.',
      },
      {
        id: '0xabc',
        name: 'Azur Exclusive Tournament',
        description: 'Exclusive tournament for Azur NFT holders only!',
        tournamentType: 3, // Monthly
        status: 0, // Registration phase
        startTime: now + 3 * day, // Starts in 3 days
        endTime: now + 33 * day, // Ends in 33 days
        entryFee: '0',
        totalParticipants: 17,
        registrationEndTime: now + 3 * day, // Registration ends when tournament starts
        minParticipants: 30, // Need 30 participants to start
        allowedCollections: ['0xAzur'], // Only Azur NFTs can participate
        isTokenGated: true, // Token gated for Azur holders
        timeRemaining: 30 * 24 * 60 * 60, // 30 days in seconds
        prizePool: '1000',
        bannerImage: '/images/tournament-banner-azur.jpg',
        featuredImage: '/images/featured-azur.jpg',
        creatorAddress: '0x5f23...9c6d',
        rules: 'Exclusive to Azur NFT holders. Free entry. Top 3 winners will receive prizes from the community pool.',
      },
      {
        id: '0xdef',
        name: 'Premium Tournament',
        description: 'High stakes, high rewards! Entry fee required for this exclusive tournament.',
        tournamentType: 2, // Weekly
        status: 1, // Active
        startTime: now - 2 * day, // Started 2 days ago
        endTime: now + 5 * day, // Ends in 5 days
        entryFee: '0.2', // Higher entry fee
        totalParticipants: 64,
        isTokenGated: false,
      },
    ];
  }

  createTournamentTransaction(
    name: string,
    description: string,
    tournamentType: number,
    durationHours: number,
    entryFee: number,
    initialPrize: number,
    options?: {
      registrationHours?: number; // Hours for registration phase
      minParticipants?: number; // Minimum participants to start
      allowedCollections?: string[]; // Collection IDs that can participate
      isTokenGated?: boolean; // Whether tournament is restricted
    }
  ): TransactionBlock {
    const txb = new TransactionBlock();
    
    // Create a SUI coin for the initial prize
    const [coin] = txb.splitCoins(txb.gas, [txb.pure(initialPrize)]);
    
    // Add additional tournament parameters if provided
    const registrationHours = options?.registrationHours || 0;
    const minParticipants = options?.minParticipants || 0;
    
    // Prepare collection restrictions if specified
    let collectionRestrictions = [];
    if (options?.allowedCollections && options.allowedCollections.length > 0) {
      // In the actual implementation, we would encode the collection IDs
      // For now, we'll just add a placeholder for the concept
      collectionRestrictions = options.allowedCollections.map(id => 
        txb.pure(Array.from(new TextEncoder().encode(id)))
      );
    }
    
    // Call the tournament creation function with extended parameters
    const args = [
      txb.object(TOURNAMENT_REGISTRY_ID),
      txb.pure(Array.from(new TextEncoder().encode(name))),
      txb.pure(Array.from(new TextEncoder().encode(description))),
      txb.pure(registrationHours), // Registration phase duration
      txb.pure(minParticipants), // Minimum participants needed
      txb.pure(tournamentType),
      txb.pure(durationHours),
      txb.pure(entryFee),
      coin,
      txb.object('0x6')  // Clock object
    ];
    
    // Add collection restrictions if specified
    if (collectionRestrictions.length > 0) {
      // In a real implementation, we would pass the collection restrictions
      // to the smart contract. For now, we'll just log them.
      console.log('Tournament restricted to collections:', options?.allowedCollections);
      
      // The actual implementation would add these to the args array
      // args.push(txb.pure(collectionRestrictions));
    }
    
    // Add token gating flag if specified
    if (options?.isTokenGated) {
      // In a real implementation, we would pass the token gating flag
      // to the smart contract. For now, we'll just log it.
      console.log('Tournament is token gated');
      
      // The actual implementation would add this to the args array
      // args.push(txb.pure(true));
    }
    
    txb.moveCall({
      target: `${TOURNAMENT_PACKAGE_ID}::tournament_entry::create_tournament_entry`,
      arguments: args,
    });
    
    return txb;
  }

  registerNFTTransaction(
    tournamentId: string,
    nftId: string,
    entryFee: number
  ): TransactionBlock {
    const txb = new TransactionBlock();
    
    // Create a SUI coin for the entry fee
    const [coin] = txb.splitCoins(txb.gas, [txb.pure(entryFee)]);
    
    // Call the NFT registration function
    txb.moveCall({
      target: `${TOURNAMENT_PACKAGE_ID}::tournament_entry::register_nft_entry`,
      arguments: [
        txb.object(tournamentId),
        txb.pure(nftId),
        coin,
        txb.object('0x6'),  // Clock object
      ],
    });
    
    return txb;
  }

  registerNFTWithImageTransaction(
    tournamentId: string,
    nftId: string,
    walrusBlobId: string,
    blobHash: string,
    entryFee: number
  ): TransactionBlock {
    const txb = new TransactionBlock();
    
    // Create a SUI coin for the entry fee
    const [coin] = txb.splitCoins(txb.gas, [txb.pure(entryFee)]);
    
    // Call the NFT registration function with image
    txb.moveCall({
      target: `${TOURNAMENT_PACKAGE_ID}::tournament_entry::register_nft_with_image_entry`,
      arguments: [
        txb.object(tournamentId),
        txb.pure(nftId),
        txb.pure(walrusBlobId),
        txb.pure(Array.from(new TextEncoder().encode(blobHash))),
        coin,
        txb.object('0x6'),  // Clock object
      ],
    });
    
    return txb;
  }

  voteForNFTTransaction(
    tournamentId: string,
    nftId: string
  ): TransactionBlock {
    const txb = new TransactionBlock();
    
    // Call the voting function
    txb.moveCall({
      target: `${TOURNAMENT_PACKAGE_ID}::tournament_entry::vote_for_nft_entry`,
      arguments: [
        txb.object(tournamentId),
        txb.pure(nftId),
        txb.object('0x6'),  // Clock object
      ],
    });
    
    return txb;
  }
  
  /**
   * Calculates prize distribution based on participant count
   * - If participants < 5: Winner takes all
   * - If participants >= 5: Top 3 get prizes (60%, 30%, 10%)
   */
  async calculatePrizeDistribution(
    tournamentId: string,
    entries: NFTEntry[]
  ): Promise<TournamentWinner[]> {
    if (!entries || entries.length === 0) {
      return [];
    }
    
    // Get tournament details
    const tournament = await this.getTournamentById(tournamentId);
    if (!tournament) {
      throw new Error(`Tournament with ID ${tournamentId} not found`);
    }
    
    // Sort entries by votes (descending)
    const sortedEntries = [...entries].sort((a, b) => b.votes - a.votes);
    
    const winners: TournamentWinner[] = [];
    // Parse prize pool to number and provide default if undefined
    const prizePool = tournament.prizePool ? parseFloat(tournament.prizePool) : 0;
    
    // Constants matching the Move contract
    const MIN_PARTICIPANTS_FOR_TOP_THREE = 5;
    const FIRST_PLACE_PERCENTAGE = 0.6; // 60%
    const SECOND_PLACE_PERCENTAGE = 0.3; // 30%
    const THIRD_PLACE_PERCENTAGE = 0.1; // 10%
    
    if (entries.length < MIN_PARTICIPANTS_FOR_TOP_THREE) {
      // Winner takes all if fewer than 5 participants
      if (sortedEntries.length > 0) {
        const winner = sortedEntries[0];
        winners.push({
          nftId: winner.nftId,
          owner: winner.owner,
          rank: 1,
          prize: prizePool.toString(),
        });
        
        console.log(`Prize distribution: Winner takes all (${prizePool} SUI) - ${winner.owner}`);
      }
    } else {
      // Top 3 get prizes if 5 or more participants
      // Calculate prize amounts
      const firstPrize = Math.floor(prizePool * FIRST_PLACE_PERCENTAGE);
      const secondPrize = Math.floor(prizePool * SECOND_PLACE_PERCENTAGE);
      const thirdPrize = Math.floor(prizePool * THIRD_PLACE_PERCENTAGE);
      
      // Determine max winners (up to 3 depending on participant count)
      const maxWinners = Math.min(3, sortedEntries.length);
      
      for (let i = 0; i < maxWinners; i++) {
        const entry = sortedEntries[i];
        const rank = i + 1;
        let prizeAmount = 0;
        
        // Determine prize amount based on rank
        if (rank === 1) prizeAmount = firstPrize;
        else if (rank === 2) prizeAmount = secondPrize;
        else prizeAmount = thirdPrize;
        
        winners.push({
          nftId: entry.nftId,
          owner: entry.owner,
          rank,
          prize: prizeAmount.toString(),
        });
        
        console.log(`Prize distribution: Rank ${rank} receives ${prizeAmount} SUI - ${entry.owner}`);
      }
    }
    
    // Update tournament with winners
    tournament.winners = winners;
    
    return winners;
  }
  
  /**
   * Distributes prizes to winners based on tournament results
   * This would be called when a tournament ends
   */
  distributePrizesTransaction(
    tournamentId: string,
    winners: TournamentWinner[]
  ): TransactionBlock {
    const txb = new TransactionBlock();
    
    // Call the prize distribution function
    // In a real implementation, this would distribute SUI to the winners
    txb.moveCall({
      target: `${TOURNAMENT_PACKAGE_ID}::tournament_entry::distribute_prizes`,
      arguments: [
        txb.object(tournamentId),
        // Convert winners to the format expected by the smart contract
        txb.pure(winners.map(winner => ({
          owner: winner.owner,
          prize: parseFloat(winner.prize),
          rank: winner.rank
        }))),
        txb.object('0x6'),  // Clock object
      ],
    });
    
    return txb;
  }
  
  /**
   * Ends a tournament and triggers prize distribution
   */
  endTournamentTransaction(
    tournamentId: string
  ): TransactionBlock {
    const txb = new TransactionBlock();
    
    // Call the end tournament function
    txb.moveCall({
      target: `${TOURNAMENT_PACKAGE_ID}::tournament_entry::end_tournament`,
      arguments: [
        txb.object(tournamentId),
        txb.object('0x6'),  // Clock object
      ],
    });
    
    return txb;
  }
  
  /**
   * Helper method to get a tournament by ID
   * In a real implementation, this would fetch from the blockchain
   */
  private async getTournamentById(tournamentId: string): Promise<Tournament | undefined> {
    // This is a mock implementation
    const tournaments = await this.getTournaments();
    return tournaments.find(t => t.id === tournamentId);
  }
}
