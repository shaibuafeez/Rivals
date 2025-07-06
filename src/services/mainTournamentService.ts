import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

export interface MainTournamentEntry {
  nftId: string;
  owner: string;
  votes: number;
  imageUrl?: string;
}

export class MainTournamentService {
  private suiClient: SuiClient;
  private packageId: string;

  constructor(suiClient: SuiClient, packageId: string) {
    this.suiClient = suiClient;
    this.packageId = packageId;
  }

  /**
   * Vote for an NFT in the main tournament contract
   */
  voteForNFTTransaction(tournamentId: string, nftId: string): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::tournament::vote_for_nft`,
      arguments: [
        tx.object(tournamentId),
        tx.pure.id(nftId),
        tx.object('0x6'), // Clock object
      ],
    });

    return tx;
  }

  /**
   * Get tournament entries from the Table structure
   * Note: This is more complex as entries are stored in a Sui Table
   */
  async getTournamentEntries(tournamentId: string): Promise<MainTournamentEntry[]> {
    try {
      // First get the tournament object
      const tournament = await this.suiClient.getObject({
        id: tournamentId,
        options: { 
          showContent: true,
          showType: true 
        },
      });

      if (!tournament.data?.content || tournament.data.content.dataType !== 'moveObject') {
        return [];
      }

      const fields = tournament.data.content.fields as any;
      
      // Get the participants table ID
      const participantsTableId = fields.participants?.fields?.id?.id;
      if (!participantsTableId) {
        console.log('No participants table found');
        return [];
      }

      // Get the size of the table to know if there are entries
      const tableSize = parseInt(fields.participants?.fields?.size || '0');
      if (tableSize === 0) {
        console.log('No participants in tournament');
        return [];
      }

      // For tables, we need to use getDynamicFields to iterate
      // This is a limitation - we can't easily get all entries at once
      // In a real implementation, you'd need to paginate through the table
      console.log(`Tournament has ${tableSize} participants in table ${participantsTableId}`);
      
      // For now, return empty array as getting table contents requires pagination
      // and knowledge of the NFT IDs
      return [];
    } catch (error) {
      console.error('Error fetching tournament entries:', error);
      return [];
    }
  }

  /**
   * Check if the tournament is using the main contract by checking its type
   */
  async isMainTournament(tournamentId: string): Promise<boolean> {
    try {
      const obj = await this.suiClient.getObject({
        id: tournamentId,
        options: { showType: true }
      });
      
      const type = obj.data?.type || '';
      return type.includes(`${this.packageId}::tournament::Tournament`);
    } catch (error) {
      return false;
    }
  }
}