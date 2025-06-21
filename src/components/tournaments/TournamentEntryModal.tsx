'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { toast } from 'react-hot-toast';
import GeneralNFTSelector from '@/components/nfts/GeneralNFTSelector';
import { NFTMetadata } from '@/services/nftService';
import { azurGuardianService, AzurGuardianNFT } from '@/services/azurGuardianService';
// import { uploadToWalrus } from '@/services/walrusService';
import Image from 'next/image';
import { X } from 'lucide-react';

interface TournamentEntryModalProps {
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

export default function TournamentEntryModal({ 
  isOpen, 
  onClose, 
  tournament,
  onSuccess 
}: TournamentEntryModalProps) {
  const [step, setStep] = useState<'select' | 'preview' | 'processing'>('select');
  const [selectedNft, setSelectedNft] = useState<NFTMetadata | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [azurNFTs, setAzurNFTs] = useState<AzurGuardianNFT[]>([]);
  const [loadingAzur, setLoadingAzur] = useState(false);
  
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  
  // Fetch Azur Guardian NFTs when modal opens and tournament is Azur Guardian exclusive
  useEffect(() => {
    async function fetchAzurGuardianNFTs() {
      if (!isOpen || !tournament.is_azur_guardian_exclusive || !account?.address) {
        return;
      }
      
      console.log('🛡️ TournamentEntryModal: Fetching Azur Guardian NFTs...');
      console.log('🎯 Tournament is Azur Guardian exclusive:', tournament.is_azur_guardian_exclusive);
      console.log('💼 Wallet address:', account.address);
      
      try {
        setLoadingAzur(true);
        const nfts = await azurGuardianService.getWalletAzurGuardianNFTs(account.address);
        console.log('✅ Found Azur Guardian NFTs:', nfts.length);
        setAzurNFTs(nfts);
        
        // Add test NFTs if none found
        if (nfts.length === 0) {
          console.log('🧪 No real Azur NFTs found, adding test NFTs...');
          setAzurNFTs([
            {
              id: '0xtest_azur_modal_1',
              name: 'Test Azur Guardian #1',
              description: 'Test Azur Guardian for tournament entry',
              imageUrl: '/images/nft-azur.png',
              collection: 'Azur Guardians (Test)',
              owner: account.address,
              location: 'kiosk' as const,
              kioskId: '0xtest_kiosk_modal_1'
            },
            {
              id: '0xtest_azur_modal_2',
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
        console.error('❌ Error fetching Azur Guardian NFTs:', error);
        toast.error('Failed to load Azur Guardian NFTs');
      } finally {
        setLoadingAzur(false);
      }
    }
    
    fetchAzurGuardianNFTs();
  }, [isOpen, tournament.is_azur_guardian_exclusive, account?.address]);
  
  if (!isOpen) return null;
  
  const handleNftSelect = (nft: NFTMetadata) => {
    setSelectedNft(nft);
    setStep('preview');
  };
  
  const handleConfirmEntry = async () => {
    if (!selectedNft || !account?.address) {
      toast.error('Please select an NFT and connect your wallet');
      return;
    }
    
    // Validate tournament data
    if (!tournament?.id || !tournament?.entry_fee) {
      console.error('❌ Invalid tournament data:', tournament);
      toast.error('Invalid tournament data. Please refresh and try again.');
      return;
    }
    
    setStep('processing');
    setUploadProgress(10);
    
    try {
      // Step 1: Use image URL directly (Walrus upload can be added later)
      const imageUrl = selectedNft.imageUrl;
      setUploadProgress(30);
      console.log('Using NFT image URL:', imageUrl);
      console.log('NFT location:', selectedNft.location);
      console.log('Kiosk ID:', selectedNft.kioskId);
      console.log('Tournament data:', tournament);
      console.log('Account address:', account.address);
      
      setUploadProgress(60);
      
      // Step 2: Create tournament entry transaction using SimpleTournamentService
      console.log('🎯 Creating simple tournament entry transaction:', {
        tournamentId: tournament.id,
        nftId: selectedNft.id,
        imageUrl: imageUrl,
        address: account.address
      });
      
      // Import and use SimpleTournamentService
      const { SimpleTournamentService } = await import('@/services/simpleTournamentService');
      const { SuiClient } = await import('@mysten/sui/client');
      
      const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL! });
      const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID!;
      const service = new SimpleTournamentService(suiClient, PACKAGE_ID);
      
      // Create entry transaction (0.01 SUI entry fee for simple tournaments)
      console.log('Creating transaction with sender:', account.address);
      const tx = service.enterTournamentTransaction(
        tournament.id,
        selectedNft.id,
        imageUrl,
        account.address
      );
      
      // Ensure sender is set on the transaction
      console.log('Setting sender on transaction to:', account.address);
      tx.setSender(account.address);
      
      setUploadProgress(80);
      
      // Step 3: Execute tournament entry transaction
      console.log('🚀 Executing simple tournament entry transaction');
      
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('✅ Tournament entry successful:', result);
            setUploadProgress(100);
            
            // Store entry info
            const entryInfo = {
              tournamentId: tournament.id,
              nftId: selectedNft.id,
              timestamp: Date.now(),
              entryId: result.digest || 'unknown'
            };
            localStorage.setItem('lastEnteredTournament', JSON.stringify(entryInfo));
            
            toast.success('🎉 Successfully entered tournament!');
            
            // Call success callback and close modal
            if (onSuccess) {
              onSuccess();
            }
            onClose();
          },
          onError: (error) => {
            console.error('❌ Tournament entry failed:', error);
            setStep('preview');
            setUploadProgress(0);
            
            // Handle specific error cases
            if (error.message?.includes('EAlreadyEntered')) {
              toast.error('You have already entered this tournament.');
            } else if (error.message?.includes('ETournamentEnded')) {
              toast.error('This tournament has already ended.');
            } else if (error.message?.includes('insufficient')) {
              toast.error('Insufficient balance. You need ~0.03 SUI to enter.');
            } else {
              toast.error(`Entry failed: ${error.message || 'Unknown error'}`);
            }
          }
        }
      );
      
      // Step 3: Dry run the transaction first to check gas costs
      try {
        console.log('🔍 Performing dry run to check gas costs...');
        const dryRunResult = await suiClient.dryRunTransactionBlock({
          transactionBlock: await tx.build({ client: suiClient })
        });
        
        console.log('💰 Dry run results:', {
          gasUsed: dryRunResult.effects.gasUsed,
          gasCost: `${(parseInt(dryRunResult.effects.gasUsed.computationCost) + parseInt(dryRunResult.effects.gasUsed.storageCost)) / 1_000_000_000} SUI`,
          status: dryRunResult.effects.status,
          error: dryRunResult.effects.status.error
        });
        
        if (dryRunResult.effects.status.error) {
          console.error('❌ Dry run failed:', dryRunResult.effects.status.error);
          toast.error(`Transaction will fail: ${dryRunResult.effects.status.error}`);
          setStep('preview');
          setUploadProgress(0);
          return;
        }
        
        // Calculate total cost
        const entryFeeNumber = parseInt(tournament.entry_fee || '10000000'); // Default to 0.01 SUI
        const gasCost = parseInt(dryRunResult.effects.gasUsed.computationCost) + parseInt(dryRunResult.effects.gasUsed.storageCost);
        const totalCost = gasCost + entryFeeNumber;
        console.log('💵 Total transaction cost:', {
          entryFee: `${entryFeeNumber / 1_000_000_000} SUI`,
          gasCost: `${gasCost / 1_000_000_000} SUI`,
          total: `${totalCost / 1_000_000_000} SUI`
        });
        
      } catch (dryRunError) {
        console.error('❌ Dry run error:', dryRunError);
      }
      
      // Step 4: Execute transaction
      signAndExecute(
        { 
          transaction: tx
        },
        {
          onSuccess: (result) => {
            console.log('🎉 Tournament entry successful!', result);
            
            try {
              // Safely access transaction details
              console.log('📊 Transaction breakdown:', {
                digest: result.digest,
                effects: result.effects,
                entryFee: `${(parseInt(tournament.entry_fee) / 1_000_000_000).toFixed(3)} SUI`
              });
              
              // Since we have a digest, the transaction was successful
              if (!result.digest) {
                console.error('❌ No transaction digest found');
                toast.error('Transaction failed. Please try again.');
                setStep('preview');
                setUploadProgress(0);
                return;
              }
            } catch (error) {
              console.error('Error processing transaction result:', error);
            }
            
            setUploadProgress(100);
            
            toast.success(
              <div>
                <p className="font-semibold">Successfully entered tournament!</p>
                <p className="text-sm mt-1">{selectedNft.name} is now competing</p>
              </div>
            );
            
            // Store entry in localStorage for tracking
            // Note: The effects are base64-encoded in the new wallet standard, 
            // so we can't easily extract created objects without decoding.
            // For now, we'll just store the transaction digest for reference.
            localStorage.setItem('lastEnteredTournament', JSON.stringify({
              tournamentId: tournament.id,
              transactionDigest: result.digest,
              timestamp: Date.now()
            }));
            console.log('📝 Stored tournament entry:', { tournamentId: tournament.id, digest: result.digest });
            
            setTimeout(() => {
              console.log('🎉 Calling onSuccess callback...');
              console.log('📝 Transaction digest for verification:', result.digest);
              console.log('🔗 View on SuiVision:', `https://suivision.xyz/txblock/${result.digest}`);
              
              if (onSuccess) {
                onSuccess();
              } else {
                console.warn('⚠️ No onSuccess callback provided');
              }
              onClose();
              setStep('select');
              setSelectedNft(null);
              setUploadProgress(0);
            }, 1500);
          },
          onError: (error) => {
            console.error('❌ Tournament entry failed:', error);
            console.error('Full error details:', {
              message: error.message,
              cause: error.cause,
              stack: error.stack
            });
            
            // More specific error messages
            if (error.message?.includes('Insufficient balance')) {
              toast.error('Insufficient SUI balance for entry fee');
            } else if (error.message?.includes('ETournamentNotActive')) {
              toast.error('Tournament is not active');
            } else if (error.message?.includes('ENFTAlreadyRegistered')) {
              toast.error('This NFT is already registered in the tournament');
            } else if (error.message?.includes('ENFTNotAzurGuardian')) {
              toast.error('Only Azur Guardian NFTs can enter this tournament');
            } else if (error.message?.includes('EInvalidNFT')) {
              toast.error('This NFT type is not allowed in this tournament');
            } else {
              toast.error(`Failed to enter tournament: ${error.message || 'Unknown error'}`);
            }
            
            setStep('preview');
            setUploadProgress(0);
          },
        }
      );
    } catch (error) {
      console.error('Error during tournament entry:', error);
      toast.error('Something went wrong. Please try again.');
      setStep('preview');
      setUploadProgress(0);
    }
  };
  
  const renderContent = () => {
    switch (step) {
      case 'select':
        return (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">
                Enter Tournament
              </h2>
              <p className="text-xl text-gray-300 mb-1">
                {tournament.name}
              </p>
              <p className="text-gray-400 text-sm">
                Select an NFT to compete for glory
              </p>
              {tournament.is_azur_guardian_exclusive && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30">
                  <span className="text-sm font-bold text-purple-400 uppercase tracking-wider">
                    🛡️ Azur Guardian Exclusive
                  </span>
                </div>
              )}
            </div>
            
            {tournament.is_azur_guardian_exclusive ? (
              /* Azur Guardian NFT Selector */
              <div>
                {loadingAzur ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-gray-800 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your Azur Guardian NFTs...</p>
                  </div>
                ) : azurNFTs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">
                      No Azur Guardian NFTs Found
                    </h3>
                    <p className="text-gray-400 mb-4">
                      You don't have any Azur Guardian NFTs to enter in this exclusive tournament.
                    </p>
                    <p className="text-sm text-purple-500">
                      This tournament is only available to Azur Guardian NFT holders.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {azurNFTs.map((nft) => (
                      <div
                        key={nft.id}
                        onClick={() => handleNftSelect({
                          id: nft.id,
                          name: nft.name,
                          description: nft.description || '',
                          imageUrl: nft.imageUrl,
                          collection: nft.collection,
                          owner: nft.owner,
                          location: nft.location,
                          kioskId: nft.kioskId
                        })}
                        className={`cursor-pointer overflow-hidden border transition-all duration-300 transform hover:scale-[1.02] nft-select-feedback ${
                          selectedNft?.id === nft.id
                            ? 'border-purple-500 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/20 selected'
                            : 'border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="aspect-square relative bg-gray-900">
                          <Image
                            src={nft.imageUrl.startsWith('ipfs://') 
                              ? `https://ipfs.io/ipfs/${nft.imageUrl.slice(7)}`
                              : nft.imageUrl
                            }
                            alt={nft.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/nft-azur.png';
                            }}
                          />
                          {/* Location Badge */}
                          <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                            nft.location === 'kiosk' 
                              ? 'bg-purple-500 text-black' 
                              : 'bg-green-500 text-black'
                          }`}>
                            {nft.location === 'kiosk' ? 'Kiosk' : 'Wallet'}
                          </div>
                          {/* Selection Indicator */}
                          {selectedNft?.id === nft.id && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-black border-t border-gray-800">
                          <h4 className="font-bold text-white text-sm truncate uppercase tracking-wider">
                            {nft.name}
                          </h4>
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {nft.collection}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* General NFT Selector for non-exclusive tournaments */
              <>
                <GeneralNFTSelector 
                  onSelect={handleNftSelect}
                  selectedNftId={selectedNft?.id}
                />
                
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-blue-400">
                    <span className="font-bold">Open Tournament:</span> You can enter with any NFT you own.
                  </p>
                </div>
              </>
            )}
            
            <div className="mt-8 p-4 bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 uppercase tracking-wider">Entry Fee</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white font-mono">
                    {(parseInt(tournament.entry_fee) / 1_000_000_000).toFixed(3)}
                  </span>
                  <span className="text-sm font-bold text-gray-400 uppercase">SUI</span>
                </div>
              </div>
            </div>
          </>
        );
        
      case 'preview':
        return selectedNft && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">
                Confirm Entry
              </h2>
              <p className="text-gray-400">
                Review your selection before entering the battle
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 border border-gray-800">
              <div className="flex items-start space-x-4">
                <div className="relative w-24 h-24 overflow-hidden flex-shrink-0 border border-gray-800">
                  {selectedNft.imageUrl ? (
                    <Image
                      src={selectedNft.imageUrl}
                      alt={selectedNft.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">
                    {selectedNft.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {selectedNft.collection && (
                      <span className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider">
                        {selectedNft.collection.split('::').pop()}
                      </span>
                    )}
                    
                    {selectedNft.location === 'kiosk' && (
                      <span className="inline-block px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
                        In Kiosk
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400 uppercase tracking-wider">Tournament</span>
                      <span className="font-bold text-white">{tournament.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400 uppercase tracking-wider">Entry Fee</span>
                      <span className="font-bold text-white font-mono">
                        {(parseInt(tournament.entry_fee) / 1_000_000_000).toFixed(3)} SUI
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-blue-400">
                  <span className="font-bold">Ready to compete!</span> Your NFT will be entered into the tournament 
                  where other players will vote. Win prizes based on your final ranking!
                </p>
                {selectedNft.location === 'kiosk' && (
                  <p className="text-sm text-blue-400 mt-2">
                    <span className="font-bold">✨ No worries!</span> Your NFT will stay safely in your kiosk. 
                    Only its image and details will be used for the tournament.
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => {
                  setStep('select');
                  setSelectedNft(null);
                }}
                className="flex-1 px-6 py-4 border border-gray-800 hover:bg-gray-900 transition-all duration-200 font-bold text-gray-400 hover:text-white uppercase tracking-wider"
              >
                Back
              </button>
              <button
                onClick={handleConfirmEntry}
                className="flex-1 px-6 py-4 bg-white text-black hover:bg-gray-200 transition-all duration-200 font-bold uppercase tracking-wider"
              >
                Confirm Entry
              </button>
            </div>
          </>
        );
        
      case 'processing':
        return (
          <div className="py-16">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                <div 
                  className="absolute inset-0 border-4 border-purple-500 rounded-full transition-all duration-500"
                  style={{
                    clipPath: `inset(${100 - uploadProgress}% 0 0 0)`,
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white font-mono">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wider">
                  Entering Tournament
                </h3>
                <p className="text-sm text-gray-400 uppercase tracking-wider">
                  {uploadProgress < 30 && 'Preparing your entry...'}
                  {uploadProgress >= 30 && uploadProgress < 60 && 'Uploading NFT data...'}
                  {uploadProgress >= 60 && uploadProgress < 80 && 'Creating blockchain transaction...'}
                  {uploadProgress >= 80 && uploadProgress < 100 && 'Confirming entry...'}
                  {uploadProgress === 100 && 'Success! Redirecting...'}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative bg-[#0a0a0a] rounded-none shadow-2xl shadow-black/50 max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
        {step !== 'processing' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-900 transition-all duration-200 group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        )}
        
        <div className="p-8 overflow-y-auto max-h-[90vh]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}