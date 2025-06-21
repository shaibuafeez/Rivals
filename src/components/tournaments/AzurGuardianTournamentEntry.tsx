'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { toast } from 'react-hot-toast';
import { AzurGuardianNFT, azurGuardianService } from '@/services/azurGuardianService';
import AzurGuardianModal from '@/components/nfts/AzurGuardianModal';
import { useWallet } from '@/hooks/useWallet';

// Constants for the tournament package
const PACKAGE_ID = process.env.NEXT_PUBLIC_TOURNAMENT_PACKAGE_ID || '0x2e17ddcc27fd52725f7304ff4dfe555c720cd8d6b7cb265e9c67ba65a3fd0b92';
const REGISTRY_ID = process.env.NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID || '0x20fc2bb8f87ce6f88e7447cc421aa6407f1aea21933e6599934d13a6329802e9';

interface AzurGuardianTournamentEntryProps {
  tournamentId: string;
  entryFee: string; // In SUI
  onSuccess?: () => void;
}

export default function AzurGuardianTournamentEntry({
  tournamentId,
  entryFee,
  onSuccess
}: AzurGuardianTournamentEntryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNft, setSelectedNft] = useState<AzurGuardianNFT | null>(null);
  const [entrySuccess, setEntrySuccess] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  
  const account = useCurrentAccount();
  const { executeTransaction } = useWallet();
  
  const handleOpenModal = () => {
    if (!account?.address) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleSelectNFT = (nft: AzurGuardianNFT) => {
    setSelectedNft(nft);
    console.log('Selected NFT:', nft);
  };
  
  const handleConfirmSelection = () => {
    if (selectedNft) {
      handleEnterTournament();
    } else {
      toast.error('Please select an NFT first');
    }
  };
  
  const handleEnterTournament = async () => {
    if (!selectedNft || !account?.address) {
      toast.error('Please select an NFT first');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Verify this is an Azur Guardian NFT
      const isAzurGuardian = await azurGuardianService.isAzurGuardianNFT(selectedNft.id);
      
      if (!isAzurGuardian) {
        toast.error('Selected NFT is not an Azur Guardian NFT');
        setIsLoading(false);
        return;
      }
      
      // Create transaction to enter tournament with the NFT
      const tx = new Transaction();
      
      // Convert entry fee from SUI to MIST (1 SUI = 10^9 MIST)
      const entryFeeInMist = Math.floor(parseFloat(entryFee) * 1e9).toString();
      
      // Split the coin for entry fee
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(entryFeeInMist)]);
      
      // Call the enter_tournament function from the Move contract
      tx.moveCall({
        target: `${PACKAGE_ID}::rivals_tournament::enter_tournament`,
        arguments: [
          tx.object(REGISTRY_ID), // Registry object
          tx.object(tournamentId), // Tournament ID
          tx.object(selectedNft.id), // NFT ID
          coin, // Entry fee
        ]
      });
      
      // Execute the transaction
      const result = await executeTransaction(tx);
      
      if (result) {
        console.log('Tournament entry successful:', result);
        setEntryId(result.digest);
        setEntrySuccess(true);
        toast.success('Successfully entered the tournament!');
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error entering tournament:', error);
      toast.error('Failed to enter tournament. Please try again.');
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };
  
  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          !account?.address
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isLoading
            ? 'bg-gray-700 text-white cursor-wait'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {!account?.address
          ? 'Connect Wallet to Enter'
          : isLoading
          ? 'Processing...'
          : entrySuccess
          ? 'Tournament Entered'
          : `Enter Tournament with Azur Guardian NFT (${entryFee} SUI)`}
      </button>
      
      <AzurGuardianModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectNFT={handleSelectNFT}
        selectedNftId={selectedNft?.id}
        onConfirm={handleConfirmSelection}
      />
      
      {entrySuccess && entryId && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-300 font-medium">
            Successfully entered the tournament!
          </p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
            Transaction ID: {entryId.substring(0, 10)}...
          </p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
            NFT: {selectedNft?.name}
          </p>
        </div>
      )}
    </>
  );
}
