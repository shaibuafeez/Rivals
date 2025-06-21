'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useSuiClient } from '@mysten/dapp-kit';
import { TournamentService } from '@/services/tournamentService';
import { castToSuiClient } from '@/types/sui-client';
import { toast } from 'react-hot-toast';
import { WalrusService } from '@/services/walrusService';

interface EnterTournamentButtonProps {
  tournamentId: string;
  entryFee: string;
  onSuccess?: () => void;
}

export default function EnterTournamentButton({ 
  tournamentId, 
  entryFee,
  onSuccess
}: EnterTournamentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, address } = useWallet();
  const suiClient = useSuiClient();

  const handleEnterTournament = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      
      // Initialize services
      const tournamentService = new TournamentService(castToSuiClient(suiClient));
      const walrusService = new WalrusService(castToSuiClient(suiClient));
      
      console.log('Services initialized for tournament:', tournamentId);
      console.log('Entry fee:', entryFee, 'SUI');
      
      // Open NFT selection modal by triggering a custom event
      // Pass the services as part of the detail to avoid recreating them
      const event = new CustomEvent('open-nft-modal', { 
        detail: { 
          tournamentId, 
          entryFee,
          tournamentService,
          walrusService
        } 
      });
      window.dispatchEvent(event);
      
      // Log for debugging
      console.log('Triggered NFT modal open event for tournament:', tournamentId);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error entering tournament:', error);
      toast.error('Failed to enter tournament. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnterTournament}
      disabled={!isConnected || isLoading}
      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
        !isConnected
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : isLoading
          ? 'bg-gray-700 text-white cursor-wait'
          : 'bg-black text-white hover:bg-gray-800'
      }`}
    >
      {!isConnected
        ? 'Connect Wallet to Enter'
        : isLoading
        ? 'Processing...'
        : `Enter Tournament (${entryFee} SUI)`}
    </button>
  );
}
