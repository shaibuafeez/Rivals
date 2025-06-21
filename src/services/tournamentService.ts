/* eslint-disable @typescript-eslint/no-explicit-any */
// Simplified tournament service that wraps SimpleTournamentService for UI compatibility
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { SimpleTournamentService, SimpleTournament } from './simpleTournamentService';

// Tournament interface for UI compatibility
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
  minParticipants?: number;
  registrationEndTime?: number;
  allowedCollections?: string[];
  isTokenGated?: boolean;
  is_azur_guardian_exclusive?: boolean;
  timeRemaining?: number;
  prizePool?: string;
  bannerImage?: string;
  rules?: string;
  featuredImage?: string;
  creatorAddress?: string;
  winners?: any[];
}

export interface TournamentWinner {
  address: string;
  rank: number;
  prize: string;
  nftId?: string;
  owner?: string;
  image?: string;
  name?: string;
}

export interface NFTEntry {
  id: string;
  nftId: string;
  owner: string;
  imageUrl: string;
  votes: number;
  tournamentId: string;
  // Additional properties expected by components
  image?: string;
  name?: string;
  rank?: number;
}

// Wrapper service that adapts SimpleTournamentService for existing UI
export class TournamentService {
  private simpleTournamentService: SimpleTournamentService;
  private suiClient: SuiClient;

  constructor(suiClient: SuiClient) {
    this.suiClient = suiClient;
    const packageId = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID || '0x0';
    this.simpleTournamentService = new SimpleTournamentService(suiClient, packageId);
  }

  // Convert SimpleTournament to Tournament
  private adaptTournament(simpleTournament: SimpleTournament): Tournament {
    return {
      id: simpleTournament.id,
      name: simpleTournament.name,
      description: simpleTournament.description,
      tournamentType: 1, // All simple tournaments are daily
      status: (Date.now() < simpleTournament.endTime && !simpleTournament.ended) ? 1 : 2,
      startTime: Date.now() - (72 * 60 * 60 * 1000), // Assume 72h duration
      endTime: simpleTournament.endTime,
      entryFee: '10000000', // 0.01 SUI in MIST
      totalParticipants: simpleTournament.entriesCount,
      minParticipants: 5,
      isTokenGated: true,
      is_azur_guardian_exclusive: true,
      prizePool: simpleTournament.prizePool.toString(),
      featuredImage: simpleTournament.bannerUrl,
      bannerImage: simpleTournament.bannerUrl,
    };
  }

  // Get all tournaments
  async getAllTournaments(): Promise<Tournament[]> {
    try {
      // Query for TournamentCreated events
      const events = await this.suiClient.queryEvents({
        query: {
          MoveEventType: `${process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID}::simple_tournament::TournamentCreated`
        },
        limit: 50,
        order: 'descending'
      });

      // Fetch details for each tournament
      const tournamentPromises = events.data
        .filter(event => (event.parsedJson as any)?.tournament_id)
        .map(async (event) => {
          const tournamentId = (event.parsedJson as any).tournament_id;
          try {
            const tournament = await this.simpleTournamentService.getTournament(tournamentId);
            return tournament ? this.adaptTournament(tournament) : null;
          } catch (error) {
            // Silently fail for individual tournament fetch
            return null;
          }
        });

      const tournaments = await Promise.all(tournamentPromises);
      return tournaments.filter(t => t !== null) as Tournament[];
    } catch (error) {
      // Silently fail - return empty array
      return [];
    }
  }

  // Get tournament by ID
  async getTournamentById(id: string): Promise<Tournament | null> {
    try {
      const simpleTournament = await this.simpleTournamentService.getTournament(id);
      return simpleTournament ? this.adaptTournament(simpleTournament) : null;
    } catch (error) {
      // Silently fail - return null
      return null;
    }
  }

  // Alias for getAllTournaments (backward compatibility)
  async getTournaments(): Promise<Tournament[]> {
    return this.getAllTournaments();
  }

  // Create tournament transaction (redirect to simple tournaments)  
  createTournamentTransaction(
    name?: string,
    description?: string,
    tournamentType?: number,
    startTime?: number,
    endTime?: number,
    entryFee?: string,
    initialPrize?: string,
    allowedCollections?: string[],
    isTokenGated?: boolean,
    isAzurGuardianExclusive?: boolean
  ): Transaction {
    throw new Error('Tournament creation should be done on /create-tournament page');
  }

  // Submit entry transaction  
  submitEntry(): Promise<string> {
    throw new Error('Tournament entry is handled through the tournament detail page');
  }

  // Mock methods for compatibility
  getMockTournaments(): Tournament[] {
    return [];
  }

  // Network verification (simplified)
  async verifyNetworkConnection(): Promise<boolean> {
    try {
      await this.suiClient.getLatestSuiSystemState();
      return true;
    } catch {
      return false;
    }
  }

  // Check if connected to mainnet (for compatibility)
  async isConnectedToMainnet(): Promise<boolean> {
    try {
      await this.suiClient.getLatestSuiSystemState();
      return true; // Simplified - assume mainnet if connection works
    } catch {
      return false;
    }
  }

  // Stub methods for backward compatibility (redirect to simple tournaments)
  createTournamentRegistryTransaction(): Transaction {
    throw new Error('Tournament registry is automatically managed');
  }

  registerNFTTransaction(tournamentId?: string, nftId?: string, entryFee?: number): Transaction {
    throw new Error('NFT registration is not required for simple tournaments');
  }

  registerKioskNFTTransaction(tournamentId?: string, nftId?: string, kiosk?: any, kioskCap?: any): Transaction {
    throw new Error('Kiosk NFT registration is not required for simple tournaments');
  }

  registerNFTWithImageTransaction(tournamentId?: string, nftId?: string, imageUrl?: string, entryFee?: number, walletAddress?: string): Transaction {
    throw new Error('NFT registration with image is not required for simple tournaments');
  }

  voteForNFTTransaction(tournamentId?: string, nftId?: string): Transaction {
    throw new Error('Voting should be done on the tournament detail page');
  }

  async voteForNFT(tournamentId?: string, nftId?: string, address?: string): Promise<string> {
    throw new Error('Voting should be done on the tournament detail page');
  }

  async getTournamentEntries(tournamentId?: string): Promise<NFTEntry[]> {
    return [];
  }

  async hasUserVotedForNFT(tournamentId?: string, nftId?: string, address?: string): Promise<boolean> {
    return false;
  }

  async registerForTournament(tournamentId?: string, nftId?: string): Promise<string> {
    throw new Error('Tournament registration is not required for simple tournaments');
  }

  async submitKioskNFTEntry(tournamentId?: string, nftId?: string, kiosk?: any, kioskCap?: any): Promise<string> {
    throw new Error('NFT entry submission is handled through the tournament detail page');
  }

  async verifyTournamentRequirements(tournamentId?: string, address?: string): Promise<{ eligible: boolean; reason?: string; eligibleNfts?: any[] }> {
    return { eligible: false, reason: 'Tournament verification is automatic' };
  }

  async calculatePrizeDistributionFromEntries(tournamentId?: string, entries?: NFTEntry[]): Promise<TournamentWinner[]> {
    return [];
  }

  distributePrizesTransaction(tournamentId?: string, winners?: TournamentWinner[]): Transaction {
    throw new Error('Prize distribution is handled automatically by the smart contract');
  }
}

export default TournamentService;