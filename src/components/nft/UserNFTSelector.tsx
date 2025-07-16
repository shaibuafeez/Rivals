import React, { useState, useEffect } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
// Import NFTService for real blockchain data
import { NFTService } from '@/services/nftService';

// Use the KioskNFT type for NFTs from kiosks
export interface UserNFT {
  objectId: string; // Maps to 'id' in KioskNFT
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

interface UserNFTSelectorProps {
  onSelectNFT: (nft: UserNFT) => void;
  selectedNFT?: UserNFT | null;
  collectionType?: string;
}

const AZUR_GUARDIAN_TYPE = process.env.NEXT_PUBLIC_AZUR_GUARDIAN_NFT_TYPE!;

const UserNFTSelector: React.FC<UserNFTSelectorProps> = ({ 
  onSelectNFT, 
  selectedNFT = null,
  collectionType = AZUR_GUARDIAN_TYPE
}) => {
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useWallet();
  const suiClient = useSuiClient();
  
  // Default fallback image for NFTs
  const fallbackImage = '/images/avatars/telegram-cloud-photo-size-1-5037512497065733520-y.jpg';

  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        setError('Please connect your wallet to view your NFTs');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching real NFTs from blockchain for address:', address);
        
        // Initialize the NFT service with the Sui client
        // Our updated NFTService can handle different client implementations
        const nftService = new NFTService(suiClient);
        
        // Fetch Azur Guardian NFTs from kiosks
        const kioskNFTs = await nftService.fetchAzurGuardianNFTsFromKiosk(address);
        
        console.log('Fetched kiosk NFTs:', kioskNFTs);
        
        // Convert KioskNFT to UserNFT format
        const userNFTs: UserNFT[] = kioskNFTs.map(nft => ({
          objectId: nft.id,
          name: nft.name || `Azur Guardian #${nft.id.substring(0, 6)}`,
          description: nft.description || 'An Azur Guardian NFT',
          imageUrl: nft.imageUrl,
          collection: nft.collection || AZUR_GUARDIAN_TYPE,
          attributes: nft.attributes,
          owner: nft.owner,
          kioskId: nft.kioskId,
          kioskOwner: nft.kioskOwner,
          isListed: nft.isListed,
          price: nft.price
        }));
        
        // If no NFTs found, show a message but don't use mock data in production
        if (userNFTs.length === 0) {
          setError('No Azur Guardian NFTs found in your kiosks');
        }
        
        setUserNFTs(userNFTs);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user NFTs:', err);
        setError('Failed to fetch your NFTs. Please try again later.');
        toast.error('Failed to fetch your NFTs');
        setUserNFTs([]);
      }
    };

    fetchUserNFTs();
  }, [address, isConnected, collectionType, suiClient]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Select an NFT to enter the tournament</h3>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading your NFTs...</span>
        </div>
      )}
      
      {error && !loading && (
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg mb-4">
          <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
        </div>
      )}
      
      {!loading && !error && userNFTs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {userNFTs.map((nft) => (
            <div 
              key={nft.objectId}
              className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                selectedNFT?.objectId === nft.objectId 
                  ? 'border-blue-500 shadow-md scale-105' 
                  : 'border-gray-200 dark:border-gray-700 hover:shadow-sm'
              }`}
              onClick={() => onSelectNFT(nft)}
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                <Image 
                  src={nft.imageUrl || fallbackImage}
                  alt={nft.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover"
                  priority={true}
                  onError={() => {
                    console.log('NFT image failed to load, using fallback');
                    // Next/Image handles errors differently, we'll use fallback images in the src prop
                  }}
                />
                {selectedNFT?.objectId === nft.objectId && (
                  <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">{nft.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">ID: {nft.objectId.substring(0, 8)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && !error && userNFTs.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-300">No Azur Guardian NFTs found in your wallet</p>
        </div>
      )}
    </div>
  );
};

export default UserNFTSelector;
