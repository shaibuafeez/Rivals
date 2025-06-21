'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { X, Shield, Wallet, CheckCircle } from 'lucide-react';
import { NFTMetadata } from '@/services/nftService';
import { azurGuardianService, AzurGuardianNFT } from '@/services/azurGuardianService';

interface ImprovedTournamentEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: {
    id: string;
    name: string;
    entry_fee: string;
    is_azur_guardian_exclusive: boolean;
  };
  onSuccess?: () => void;
}

export default function ImprovedTournamentEntryModal({ 
  isOpen, 
  onClose, 
  tournament,
  onSuccess 
}: ImprovedTournamentEntryModalProps) {
  const [selectedNft, setSelectedNft] = useState<NFTMetadata | null>(null);
  const [azurNFTs, setAzurNFTs] = useState<AzurGuardianNFT[]>([]);
  const [loadingAzur, setLoadingAzur] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Fetch Azur Guardian NFTs
  useEffect(() => {
    async function fetchAzurGuardianNFTs() {
      if (!isOpen || !tournament.is_azur_guardian_exclusive || !account?.address) {
        return;
      }
      
      try {
        setLoadingAzur(true);
        const nfts = await azurGuardianService.getWalletAzurGuardianNFTs(account.address);
        setAzurNFTs(nfts);
        
        // Add test NFTs if none found
        if (nfts.length === 0) {
          setAzurNFTs([
            {
              id: '0xtest_azur_improved_1',
              name: 'Test Azur Guardian #1',
              description: 'Test Azur Guardian for tournament entry',
              imageUrl: '/images/nft-azur.png',
              collection: 'Azur Guardians (Test)',
              owner: account.address,
              location: 'kiosk' as const,
              kioskId: '0xtest_kiosk_1'
            },
            {
              id: '0xtest_azur_improved_2',
              name: 'Test Azur Guardian #2', 
              description: 'Test Azur Guardian for tournament entry',
              imageUrl: '/images/nft-azur.png',
              collection: 'Azur Guardians (Test)',
              owner: account.address,
              location: 'wallet' as const
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching Azur Guardian NFTs:', error);
        toast.error('Failed to load Azur Guardian NFTs');
      } finally {
        setLoadingAzur(false);
      }
    }
    
    fetchAzurGuardianNFTs();
  }, [isOpen, tournament.is_azur_guardian_exclusive, account?.address]);

  const handleConfirmEntry = async () => {
    if (!selectedNft || !account?.address) {
      toast.error('Please select an NFT and connect your wallet');
      return;
    }
    
    setSubmitting(true);
    setUploadProgress(10);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Import and use SimpleTournamentService
      const { SimpleTournamentService } = await import('@/services/simpleTournamentService');
      const { SuiClient } = await import('@mysten/sui/client');
      
      const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL! });
      const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID!;
      const service = new SimpleTournamentService(suiClient, PACKAGE_ID);
      
      const tx = service.enterTournamentTransaction(
        tournament.id,
        selectedNft.id,
        selectedNft.imageUrl,
        account.address
      );
      
      tx.setSender(account.address);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            const entryInfo = {
              tournamentId: tournament.id,
              nftId: selectedNft.id,
              timestamp: Date.now(),
              entryId: result.digest || 'unknown'
            };
            localStorage.setItem('lastEnteredTournament', JSON.stringify(entryInfo));
            
            toast.success(
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="font-bold">Tournament Entry Successful!</p>
                  <p className="text-sm opacity-80">Your NFT is now competing</p>
                </div>
              </div>,
              { duration: 5000 }
            );
            
            if (onSuccess) {
              onSuccess();
            }
            onClose();
          },
          onError: (error) => {
            console.error('Tournament entry failed:', error);
            setSubmitting(false);
            setUploadProgress(0);
            
            if (error.message?.includes('insufficient')) {
              toast.error('Insufficient balance. You need ~0.03 SUI to enter.');
            } else {
              toast.error(`Entry failed: ${error.message || 'Unknown error'}`);
            }
          }
        }
      );
    } catch (error) {
      console.error('Error during tournament entry:', error);
      toast.error('Something went wrong. Please try again.');
      setSubmitting(false);
      setUploadProgress(0);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative bg-[#0a0a0a] max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-800 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
              Enter Tournament
            </h2>
            <p className="text-gray-400 mt-1 normal-case">{tournament.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-900 transition-all duration-200 group"
            disabled={submitting}
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Main Content - Side by Side Layout */}
        <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
          {/* Left Side - NFT Selection */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-gray-800">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">
                Select Your NFT
              </h3>
              <div className="flex items-center gap-2 text-sm text-purple-400">
                <Shield className="w-4 h-4" />
                <span className="font-bold uppercase tracking-wider">Azur Guardian Exclusive</span>
              </div>
            </div>

            {loadingAzur ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-900 border border-gray-800 skeleton-loading"></div>
                ))}
              </div>
            ) : azurNFTs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Shield className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">
                  No Azur Guardian NFTs Found
                </h3>
                <p className="text-gray-400 normal-case">
                  You need an Azur Guardian NFT to enter this tournament.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {azurNFTs.map((nft) => (
                  <div
                    key={nft.id}
                    onClick={() => setSelectedNft({
                      id: nft.id,
                      name: nft.name,
                      description: nft.description || '',
                      imageUrl: nft.imageUrl,
                      collection: nft.collection,
                      owner: nft.owner,
                      location: nft.location,
                      kioskId: nft.kioskId
                    })}
                    className={`cursor-pointer overflow-hidden border transition-all duration-300 hover-lift nft-select-feedback ${
                      selectedNft?.id === nft.id
                        ? 'border-purple-500 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/20 selected'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="aspect-square relative bg-gray-900">
                      <Image
                        src={nft.imageUrl}
                        alt={nft.name}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                        nft.location === 'kiosk' 
                          ? 'bg-purple-500 text-black' 
                          : 'bg-green-500 text-black'
                      }`}>
                        {nft.location === 'kiosk' ? 'Kiosk' : 'Wallet'}
                      </div>
                      {selectedNft?.id === nft.id && (
                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                          <CheckCircle className="w-12 h-12 text-white success-animation" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-black border-t border-gray-800">
                      <h4 className="font-bold text-white text-sm truncate uppercase tracking-wider">
                        {nft.name}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Preview & Confirm */}
          <div className="w-full lg:w-[400px] p-6 bg-gray-900/30 flex flex-col">
            {selectedNft ? (
              <>
                <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
                  Entry Preview
                </h3>
                
                <div className="flex-1 flex flex-col">
                  {/* Selected NFT Preview */}
                  <div className="bg-black border border-gray-800 p-4 mb-6">
                    <div className="aspect-square relative mb-4 overflow-hidden">
                      <Image
                        src={selectedNft.imageUrl}
                        alt={selectedNft.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-white text-lg mb-2 uppercase tracking-wider">
                      {selectedNft.name}
                    </h4>
                    <div className="flex items-center gap-2 mb-4">
                      {selectedNft.location === 'kiosk' && (
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                          <Wallet className="w-4 h-4 inline mr-1" />
                          In Kiosk
                        </span>
                      )}
                    </div>
                    
                    {/* Entry Details */}
                    <div className="space-y-3 border-t border-gray-800 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400 uppercase tracking-wider">Tournament</span>
                        <span className="font-bold text-white normal-case">{tournament.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400 uppercase tracking-wider">Entry Fee</span>
                        <span className="font-bold text-white font-mono">
                          {(parseInt(tournament.entry_fee) / 1_000_000_000).toFixed(3)} SUI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 mb-6">
                    <p className="text-sm text-blue-400 normal-case">
                      <span className="font-bold uppercase">Ready to compete!</span> Your NFT will enter the tournament
                      where players vote for their favorites. Win prizes based on final ranking!
                    </p>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleConfirmEntry}
                    disabled={submitting}
                    className={`w-full py-4 font-bold uppercase tracking-wider transition-all duration-200 ${
                      submitting
                        ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-200 button-press'
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing... {uploadProgress}%</span>
                      </div>
                    ) : (
                      'Confirm Entry'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-10 h-10 text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-lg normal-case">
                    Select an NFT to preview your entry
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}