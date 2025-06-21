'use client';

import { useEffect, useState } from 'react';
import TournamentEntryModal from '../nft/TournamentEntryModal';
import { toast } from 'react-hot-toast';
import { useWallet } from '@/hooks/useWallet';

// Define the NFT type
interface UserNFT {
  objectId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  collection?: string;
  attributes?: { [key: string]: string };
  owner?: string;
  kioskId?: string;
  kioskOwner?: string;
  isListed?: boolean;
  price?: string;
}

export default function GlobalNFTModalListener() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournamentId, setTournamentId] = useState('');
  const [tournamentName, setTournamentName] = useState('Azur Guardian Tournament');
  const [entryFee, setEntryFee] = useState(0);
  const { address } = useWallet();
  
  // Tournament service is no longer needed as entry is handled through the tournament detail page

  useEffect(() => {
    // Listen for the custom event to open the NFT modal
    const handleOpenNFTModal = (event: CustomEvent<{ 
      tournamentId: string; 
      entryFee: string;
      tournamentName?: string;
    }>) => {
      const { tournamentId, entryFee, tournamentName } = event.detail;
      setTournamentId(tournamentId);
      setEntryFee(Number(entryFee) || 0);
      if (tournamentName) {
        setTournamentName(tournamentName);
      }
      setIsModalOpen(true);
    };

    // Add event listener
    window.addEventListener('open-nft-modal', handleOpenNFTModal as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('open-nft-modal', handleOpenNFTModal as EventListener);
    };
  }, []);

  const handleSubmitNFT = async (nft: UserNFT) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!tournamentId) {
      toast.error('No tournament selected');
      return;
    }

    try {
      toast.loading('Submitting NFT to tournament...', { id: 'submit-nft' });

      // Log NFT information for debugging
      console.log('Submitting NFT to tournament:', nft);
      
      // Tournament entry is now handled through the tournament detail page
      // Store the selected NFT in localStorage and redirect
      localStorage.setItem('selectedNFTForTournament', JSON.stringify({
        nft,
        tournamentId,
        timestamp: Date.now()
      }));
      
      // Close the modal
      setIsModalOpen(false);
      
      // Redirect to tournament page
      toast.success('Redirecting to tournament page...', { id: 'submit-nft' });
      window.location.href = `/tournaments/${tournamentId}`;
    } catch (error) {
      console.error('Error entering tournament:', error);
      toast.error('Failed to enter tournament. Please try again.');
    }
  };

  return (
    <>
      <TournamentEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitNFT}
        tournamentName={tournamentName}
        tournamentId={tournamentId}
        entryFee={entryFee}
      />
    </>
  );
}
