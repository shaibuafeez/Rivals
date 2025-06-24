// Tournament types that match the smart contract and services

export interface TournamentEntry {
  nft_id: string;
  submitter: string;
  image_url: string;
  vote_count: number;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  banner_url: string;
  end_time: number;
  ended: boolean;
  prize_pool: number;
  entries: TournamentEntry[];
  total_votes?: number;
}

// For compatibility with SimpleTournamentService
export interface SimpleEntry {
  nftId: string;
  submitter: string;
  imageUrl: string;
  voteCount: number;
}

// Helper to convert between formats
export function convertSimpleEntry(entry: SimpleEntry): TournamentEntry {
  return {
    nft_id: entry.nftId,
    submitter: entry.submitter,
    image_url: entry.imageUrl,
    vote_count: entry.voteCount
  };
}