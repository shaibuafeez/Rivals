'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { WalrusService } from '@/services/walrusService';
import { TournamentService, Tournament } from '@/services/tournamentService';
import { useSuiClient } from '@mysten/dapp-kit';
import { castToSuiClient } from '@/types/sui-client';
import ShareTournamentEntry from './ShareTournamentEntry';

interface NFT {
  id: string;
  name: string;
  imageUrl: string;
}

interface NFTSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  entryFee: string;
  onSuccess: () => void;
}

export default function NFTSelectionModal({
  isOpen,
  onClose,
  tournamentId,
  entryFee,
  onSuccess,
}: NFTSelectionModalProps) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tournamentDetails, setTournamentDetails] = useState<Tournament | null>(null);
  const [entryId, setEntryId] = useState<string>('');
  
  const suiClient = useSuiClient();
  const { address, executeTransaction } = useWallet();
  
  // Use our utility function to safely cast the SuiClient and wrap in useMemo to avoid dependency issues
  const walrusService = useMemo(() => new WalrusService(castToSuiClient(suiClient)), [suiClient]);
  const tournamentService = useMemo(() => new TournamentService(castToSuiClient(suiClient)), [suiClient]);

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;
      
      try {
        setLoading(true);
        
        // Fetch tournament details
        const tournaments = await tournamentService.getTournaments();
        const tournament = tournaments.find((t: Tournament) => t.id === tournamentId);
        if (tournament) {
          setTournamentDetails(tournament);
        }
        
        // In a real implementation, this would fetch the user's NFTs from the blockchain
        // For now, we'll use mock data
        const mockNFTs: NFT[] = [
          {
            id: '0xnft1',
            name: 'Doonies #337',
            imageUrl: '/images/nft-skull.png',
          },
          {
            id: '0xnft2',
            name: 'Doonies #142',
            imageUrl: '/images/nft-skull.png',
          },
        ];
        
        setNfts(mockNFTs);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && !success) {
      fetchData();
    }
  }, [isOpen, address, tournamentId, tournamentService, success]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedNFT) {
      alert('Please select an NFT');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Generate a random entry ID for demo purposes
      // In a real implementation, this would be returned from the blockchain transaction
      const generatedEntryId = `0x${Math.random().toString(16).substring(2, 10)}`;
      setEntryId(generatedEntryId);
      
      if (uploadedImage) {
        // Upload image to Walrus
        const { blobId, blobHash } = await walrusService.uploadImage(uploadedImage);
        
        // Register NFT with image
        const txb = tournamentService.registerNFTWithImageTransaction(
          tournamentId,
          selectedNFT.id,
          blobId,
          blobHash,
          parseFloat(entryFee) * 1e9 // Convert to MIST
        );
        
        await executeTransaction(txb);
      } else {
        // Register NFT without image
        const txb = tournamentService.registerNFTTransaction(
          tournamentId,
          selectedNFT.id,
          parseFloat(entryFee) * 1e9 // Convert to MIST
        );
        
        await executeTransaction(txb);
      }
      
      // Store the selected NFT in local storage for demo purposes
      localStorage.setItem('lastEnteredTournament', JSON.stringify({
        tournamentId,
        entryId: generatedEntryId,
        nftId: selectedNFT.id,
        nftName: selectedNFT.name,
        tournamentName: tournamentDetails?.name || 'Tournament'
      }));
      
      // Show success state instead of closing
      setSuccess(true);
      onSuccess();
    } catch (error) {
      console.error('Error submitting NFT:', error);
      alert('Failed to enter tournament. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {success ? (
              // Success state
              <div>
                <div className="text-center mb-6">
                  <motion.div 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.1
                    }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4"
                  >
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold mb-2">Tournament Entry Confirmed!</h2>
                    <p className="text-gray-600 mb-6">
                      Your NFT has been successfully entered into the tournament. Good luck!
                    </p>
                  </motion.div>
                  
                  {tournamentDetails && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm mb-6"
                    >
                      <h3 className="font-medium text-lg mb-2">{tournamentDetails.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{tournamentDetails.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-2 rounded-lg">
                          <div className="text-gray-500 text-xs mb-1">Entry Fee</div>
                          <div className="font-semibold">{entryFee} SUI</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <div className="text-gray-500 text-xs mb-1">Participants</div>
                          <div className="font-semibold">{tournamentDetails.totalParticipants + 1}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Share tournament entry component */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {tournamentDetails && (
                    <ShareTournamentEntry
                      tournamentId={tournamentId}
                      entryId={entryId || selectedNFT?.id || ''}
                      tournamentName={tournamentDetails.name}
                    />
                  )}
                </motion.div>
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-6"
                >
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              </div>
            ) : (
              // Normal selection state
              <>
                <h2 className="text-xl font-semibold mb-4">Select an NFT to Enter</h2>
                
                {loading ? (
                  <div className="text-center py-10">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-200 mb-3"></div>
                      <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ) : nfts.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-600">
                      You don&apos;t have any NFTs to enter in this tournament.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {nfts.map(nft => (
                      <div
                        key={nft.id}
                        className={`border rounded-lg p-2 cursor-pointer transition-all ${
                          selectedNFT?.id === nft.id ? 'border-black' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedNFT(nft)}
                      >
                        <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-2">
                          <Image
                            src={nft.imageUrl}
                            alt={nft.name}
                            width={150}
                            height={150}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <p className="text-sm font-medium truncate">{nft.name}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedNFT && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">
                      Optionally upload a custom image for this tournament:
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-sm"
                    />
                    {uploadedImage && (
                      <p className="text-xs text-green-600 mt-1">
                        Image selected: {uploadedImage.name}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedNFT || submitting}
                    className={`px-4 py-2 text-sm text-white rounded-lg ${
                      !selectedNFT || submitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-800'
                    }`}
                  >
                    {submitting ? 'Submitting...' : `Enter Tournament (${entryFee} SUI)`}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
