import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

export interface SimpleTournament {
  id: string;
  name: string;
  description: string;
  bannerUrl: string;
  endTime: number;
  ended: boolean;
  prizePool: number;
  entriesCount: number;
}

export interface SimpleEntry {
  nftId: string;
  submitter: string;
  imageUrl: string;
  voteCount: number;
}

export class SimpleTournamentService {
  private suiClient: SuiClient;
  private packageId: string;

  constructor(suiClient: SuiClient, packageId: string) {
    this.suiClient = suiClient;
    this.packageId = packageId;
  }

  /**
   * Create a new tournament
   */
  createTournamentTransaction(
    name: string,
    description: string,
    bannerUrl: string,
    durationHours: number
  ): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::simple_tournament::create_tournament`,
      arguments: [
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(name))),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(description))),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(bannerUrl))),
        tx.pure.u64(durationHours),
        tx.object('0x6'), // Clock
      ],
    });

    return tx;
  }

  /**
   * Enter tournament with NFT (0.01 SUI fee)
   */
  enterTournamentTransaction(
    tournamentId: string,
    nftId: string,
    imageUrl: string,
    senderAddress: string
  ): Transaction {
    const tx = new Transaction();
    
    // Set the sender
    tx.setSender(senderAddress);
    
    // Set a reasonable gas budget to prevent excessive consumption
    tx.setGasBudget(50_000_000); // 0.05 SUI should be more than enough
    
    // Create a coin with slightly more than entry fee needed
    // The contract will split exactly ENTRY_FEE and leave remainder in the coin
    const PAYMENT_AMOUNT = 11_000_000; // 0.011 SUI (slightly more than 0.01 needed)
    const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(PAYMENT_AMOUNT)]);
    
    tx.moveCall({
      target: `${this.packageId}::simple_tournament::enter_tournament`,
      arguments: [
        tx.object(tournamentId),
        tx.pure.address(nftId),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(imageUrl))),
        paymentCoin, // Coin with payment amount
        tx.object('0x6'), // Clock
      ],
    });

    // Transfer any remaining coin balance back to sender
    // The Move function will have removed exactly 0.01 SUI, leaving 0.001 SUI remainder
    tx.transferObjects([paymentCoin], senderAddress);

    return tx;
  }

  /**
   * Vote for an NFT (anyone can vote)
   */
  voteTransaction(tournamentId: string, nftId: string): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::simple_tournament::vote`,
      arguments: [
        tx.object(tournamentId),
        tx.pure.address(nftId),
        tx.object('0x6'), // Clock
      ],
    });

    return tx;
  }

  /**
   * End tournament and distribute prizes
   */
  endTournamentTransaction(tournamentId: string): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::simple_tournament::end_tournament`,
      arguments: [
        tx.object(tournamentId),
        tx.object('0x6'), // Clock
      ],
    });

    return tx;
  }

  /**
   * Check if tournament is still active (not ended)
   */
  async isTournamentActive(tournamentId: string): Promise<boolean> {
    try {
      const tournament = await this.getTournament(tournamentId);
      if (!tournament) return false;
      
      const now = Date.now();
      return now < tournament.endTime && !tournament.ended;
    } catch (error) {
      console.error('Error checking tournament status:', error);
      return false;
    }
  }

  /**
   * Fetch tournament details
   */
  async getTournament(tournamentId: string): Promise<SimpleTournament | null> {
    try {
      const obj = await this.suiClient.getObject({
        id: tournamentId,
        options: { showContent: true },
      });

      if (!obj.data?.content || obj.data.content.dataType !== 'moveObject') {
        return null;
      }

      const fields = obj.data.content.fields as any;
      
      return {
        id: tournamentId,
        name: fields.name,
        description: fields.description,
        bannerUrl: fields.banner_url,
        endTime: parseInt(fields.end_time),
        ended: fields.ended,
        prizePool: parseInt(fields.prize_pool?.fields?.value || '0'),
        entriesCount: fields.entries?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching tournament:', error);
      return null;
    }
  }

  /**
   * Fetch tournament entries
   */
  async getTournamentEntries(tournamentId: string): Promise<SimpleEntry[]> {
    try {
      const obj = await this.suiClient.getObject({
        id: tournamentId,
        options: { showContent: true },
      });

      if (!obj.data?.content || obj.data.content.dataType !== 'moveObject') {
        return [];
      }

      const fields = obj.data.content.fields as any;
      const entries = fields.entries || [];
      
      return entries.map((entry: any) => {
        // The actual data is in the fields object
        const entryFields = entry.fields || entry;
        
        return {
          nftId: entryFields.nft_id,
          submitter: entryFields.submitter,
          imageUrl: entryFields.image_url,
          voteCount: parseInt(entryFields.vote_count || '0'),
        };
      });
    } catch (error) {
      console.error('Error fetching entries:', error);
      return [];
    }
  }

  /**
   * Check if user has voted
   */
  async hasUserVoted(tournamentId: string, userAddress: string): Promise<boolean> {
    try {
      const obj = await this.suiClient.getObject({
        id: tournamentId,
        options: { showContent: true },
      });

      if (!obj.data?.content || obj.data.content.dataType !== 'moveObject') {
        return false;
      }

      const fields = obj.data.content.fields as any;
      const voters = fields.voters || [];
      
      return voters.includes(userAddress);
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  }
}