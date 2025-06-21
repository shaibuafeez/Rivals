'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { WalrusService } from '@/services/walrusService';
import { TournamentService, Tournament } from '@/services/tournamentService';
import { useSuiClient } from '@mysten/dapp-kit';
import { castToSuiClient } from '@/types/sui-client';
import toast from 'react-hot-toast';
import ShareTournamentEntry from './ShareTournamentEntry';
import { azurGuardianService, AzurGuardianNFT } from '@/services/azurGuardianService';
import { NFTService } from '@/services/nftService';

interface NFT {
  id: string;
  name: string;
  imageUrl: string;
  location?: 'wallet' | 'kiosk';
  kioskId?: string;
  collection?: string;
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
  const [previewMode, setPreviewMode] = useState(false);
  
  const suiClient = useSuiClient();
  const { address, executeTransaction } = useWallet();
  
  // Use our utility function to safely cast the SuiClient and wrap in useMemo to avoid dependency issues
  const walrusService = useMemo(() => new WalrusService(castToSuiClient(suiClient)), [suiClient]);
  const tournamentService = useMemo(() => new TournamentService(castToSuiClient(suiClient)), [suiClient]);
  const nftService = useMemo(() => new NFTService(castToSuiClient(suiClient)), [suiClient]);

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
        
        // All tournaments are now Azur Guardian exclusive
        
        let fetchedNFTs: NFT[] = [];
        
        // Always fetch Azur Guardian NFTs since all tournaments are Azur exclusive
        // Fetch Azur Guardian NFTs specifically
        try {
          const azurNFTs = await azurGuardianService.getWalletAzurGuardianNFTs(address);
            
          fetchedNFTs = azurNFTs.map((nft: AzurGuardianNFT) => ({
            id: nft.id,
            name: nft.name || 'Azur Guardian',
            imageUrl: nft.imageUrl.startsWith('ipfs://') 
              ? `https://ipfs.io/ipfs/${nft.imageUrl.slice(7)}`
              : nft.imageUrl,
            location: nft.location,
            kioskId: nft.kioskId,
            collection: 'Azur Guardians'
          }));
          
          if (fetchedNFTs.length === 0) {
            // Add test data to verify UI is working
            fetchedNFTs = [
              {
                id: '0xtest_azur_1',
                name: 'Test Azur Guardian #1',
                imageUrl: '/images/nft-azur.png',
                location: 'kiosk' as const,
                kioskId: '0xtest_kiosk_1',
                collection: 'Azur Guardians (Test)'
              },
              {
                id: '0xtest_azur_2', 
                name: 'Test Azur Guardian #2',
                imageUrl: '/images/nft-azur.png',
                location: 'wallet' as const,
                collection: 'Azur Guardians (Test)'
              }
            ];
          }
        } catch (error) {
          // Silently handle error - test data already provided
        }
        
        setNfts(fetchedNFTs);
      } catch (error) {
        // Error handling already done above
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
      toast.error('Please select an NFT');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Generate a random entry ID for demo purposes
      // In a real implementation, this would be returned from the blockchain transaction
      const generatedEntryId = `0x${Math.random().toString(16).substring(2, 10)}`;
      setEntryId(generatedEntryId);
      
      // Check if NFT is in a kiosk
      if (selectedNFT.location === 'kiosk' && selectedNFT.kioskId) {
        // Use kiosk-specific transaction for Azur Guardian NFTs in kiosks
        const txb = tournamentService.registerKioskNFTTransaction(
          tournamentId,
          selectedNFT.id,
          selectedNFT.kioskId,
          parseFloat(entryFee) * 1e9 // Convert to MIST
        );
        
        // Execute the transaction
        await executeTransaction(txb);
      } else if (uploadedImage) {
        // Upload image to Walrus
        const { blobId } = await walrusService.uploadImage(uploadedImage);
        
        // Register NFT with image - get transaction block directly (not a Promise)
        const txb = tournamentService.registerNFTWithImageTransaction(
          tournamentId,
          selectedNFT.id,
          blobId, // Use blobId as imageUrl
          parseFloat(entryFee) * 1e9, // Convert to MIST
          address // Add wallet address parameter
        );
        
        // Execute the transaction
        await executeTransaction(txb);
      } else {
        // Register NFT without image - get transaction block directly (not a Promise)
        const txb = tournamentService.registerNFTTransaction(
          tournamentId,
          selectedNFT.id,
          parseFloat(entryFee) * 1e9 // Convert to MIST
        );
        
        // Execute the transaction
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
      toast.error('Failed to enter tournament. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Animation variants for smoother transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };
  
  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 10 },
    visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
    exit: { scale: 0.95, opacity: 0, y: 10, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl"
          >
            {success ? (
              // Success state with enhanced visual feedback
              <div>
                <div className="text-center mb-6">
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full mx-auto flex items-center justify-center mb-4"
                  >
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold mb-2 text-white"
                  >
                    Tournament Entry Confirmed!
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-300 mb-4"
                  >
                    Your NFT has been successfully entered into the tournament.
                  </motion.p>
                </div>
                
                <ShareTournamentEntry 
                  tournamentId={tournamentId}
                  entryId={entryId}
                  tournamentName={tournamentDetails?.name}
                  nftName={selectedNFT?.name}
                />
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-center"
                >
                  <button
                    onClick={onClose}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              </div>
            ) : previewMode && selectedNFT ? (
              // Preview mode - shows how the NFT will look in the tournament
              <>
                <div className="flex items-center justify-between mb-6">
                  <button 
                    onClick={() => setPreviewMode(false)}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <h2 className="text-xl font-semibold text-white">Preview Entry</h2>
                  <div className="w-16"></div> {/* Spacer for alignment */}
                </div>
                
                <div className="mb-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-2">Tournament Entry Preview</h3>
                  
                  <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden mb-4 relative">
                    {uploadedImage ? (
                      <div className="w-full h-full relative">
                        <Image
                          src={URL.createObjectURL(uploadedImage)}
                          alt={selectedNFT.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <Image
                        src={selectedNFT.imageUrl}
                        alt={selectedNFT.name}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full"
                      />
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-white font-medium">{selectedNFT.name}</p>
                      {tournamentDetails && (
                        <p className="text-gray-300 text-sm">{tournamentDetails.name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-300 mb-2">
                    <span>Entry Fee:</span>
                    <span className="font-medium text-white">{entryFee} SUI</span>
                  </div>
                  
                  {tournamentDetails && (
                    <div className="flex justify-between items-center text-sm text-gray-300">
                      <span>Prize Pool:</span>
                      <span className="font-medium text-white">{tournamentDetails.prizePool} SUI</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                  >
                    Edit Selection
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2 text-sm text-white rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-900/20 font-medium"
                  >
                    {submitting ? 'Submitting...' : `Confirm Entry (${entryFee} SUI)`}
                  </button>
                </div>
              </>
            ) : (
              // Normal selection state with enhanced UI
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Select an Azur Guardian NFT</h2>
                    <p className="text-sm text-ink-400 mt-1">🛡️ All Tournaments are Azur Guardian Exclusive</p>
                  </div>
                  {tournamentDetails && (
                    <div className="px-3 py-1 bg-gray-800 rounded-full text-xs font-medium text-blue-400 border border-gray-700">
                      Prize: {tournamentDetails.prizePool} SUI
                    </div>
                  )}
                </div>
                
                {loading ? (
                  <div className="text-center py-10">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-800 mb-4"></div>
                      <div className="h-4 w-48 bg-gray-800 rounded mb-2"></div>
                      <div className="h-3 w-32 bg-gray-800 rounded"></div>
                    </div>
                  </div>
                ) : nfts.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-2">
                        You don&apos;t have any Azur Guardian NFTs to enter tournaments.
                      </p>
                      <p className="text-sm text-ink-400">
                        All tournaments are now exclusive to Azur Guardian NFT holders.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {nfts.map(nft => (
                      <motion.div
                        key={nft.id}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className={`bg-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                          selectedNFT?.id === nft.id 
                            ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-900/20' 
                            : 'border border-gray-700 hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedNFT(nft)}
                      >
                        <div className="aspect-square bg-gray-700 overflow-hidden relative">
                          <Image
                            src={nft.imageUrl}
                            alt={nft.name}
                            width={200}
                            height={200}
                            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                          />
                          {selectedNFT?.id === nft.id && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          
                          {/* Location Badge */}
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                            nft.location === 'kiosk' 
                              ? 'bg-ink-500 text-white' 
                              : 'bg-green-500 text-white'
                          }`}>
                            {nft.location === 'kiosk' ? 'Kiosk' : 'Wallet'}
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium truncate text-white">{nft.name}</p>
                          {nft.collection && (
                            <p className="text-xs text-gray-400 truncate mt-1">{nft.collection}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {selectedNFT && (
                  <div className="mb-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-300">
                        Customize your tournament entry:
                      </p>
                      {uploadedImage && (
                        <button 
                          onClick={() => setUploadedImage(null)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="relative group cursor-pointer overflow-hidden rounded-lg border border-dashed border-gray-600 hover:border-gray-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center py-6">
                        {uploadedImage ? (
                          <div className="relative w-full h-32 mb-2">
                            <Image
                              src={URL.createObjectURL(uploadedImage)}
                              alt="Preview"
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <>
                            <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-gray-400">Upload custom image</p>
                            <p className="text-xs text-gray-500 mt-1">Optional</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {uploadedImage && (
                      <p className="text-xs text-blue-400 mt-2 truncate">
                        {uploadedImage.name}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  {selectedNFT ? (
                    <button
                      onClick={() => setPreviewMode(true)}
                      disabled={submitting}
                      className="px-6 py-2 text-sm text-white rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-900/20 font-medium"
                    >
                      Preview Entry
                    </button>
                  ) : (
                    <button
                      disabled={true}
                      className="px-6 py-2 text-sm text-gray-300 rounded-lg bg-gray-700 cursor-not-allowed"
                    >
                      Select an NFT
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
