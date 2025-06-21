import { SuiClient } from '@mysten/sui/client';
import { getFullnodeUrl } from '@mysten/sui/client';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { NFTService, NFTMetadata } from './nftService';

// Constants for Azur Guardians NFT collection (from azur checker)
export const AZUR_GUARDIANS_PACKAGE_ID = '0xfc9d0c6972cae3f303030b993485af37e2d86ebf3b409d1e6a40cde955a43a77';
export const AZUR_GUARDIANS_MODULE = 'azur_guardians';
export const AZUR_GUARDIANS_NFT_TYPE = `${AZUR_GUARDIANS_PACKAGE_ID}::${AZUR_GUARDIANS_MODULE}::Nft`;
export const BLOCKVISION_API_KEY = process.env.NEXT_PUBLIC_BLOCKVISION_API_KEY || '';

export interface AzurGuardianNFT extends NFTMetadata {
  // Add any Azur Guardian specific properties here
  rarity?: string;
  attributes?: Record<string, string>;
  isInKiosk?: boolean;
  kioskId?: string;
}

export class AzurGuardianService {
  private suiClient: SuiClient;
  private nftService: NFTService;

  constructor() {
    // Connect to mainnet since Azur Guardians are on mainnet
    this.suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });
    this.nftService = new NFTService(this.suiClient);
  }

  /**
   * Fetch all Azur Guardian NFTs owned by a wallet address (including kiosks)
   * Using the exact same approach as the azur checker
   * @param walletAddress The wallet address to check
   * @returns Array of Azur Guardian NFTs with metadata
   */
  async getWalletAzurGuardianNFTs(walletAddress: string): Promise<AzurGuardianNFT[]> {
    
    let nftObjects: AzurGuardianNFT[] = [];
    
    // Try BlockVision API for kiosk NFTs (same as azur checker)
    try {
      const url = new URL('https://api.blockvision.org/v2/sui/account/nfts');
      url.searchParams.append('account', walletAddress);
      url.searchParams.append('type', 'kiosk');
      url.searchParams.append('pageIndex', '1');
      url.searchParams.append('pageSize', '50');
      
      const headers = {
        'accept': 'application/json',
        'x-api-key': BLOCKVISION_API_KEY
      };
      
      const response = await fetch(url.toString(), { headers });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.code === 200) {
          const nfts = result.result.data || [];
          const azurNfts = nfts.filter((nft: any) => 
            nft.collection && (
              nft.collection === AZUR_GUARDIANS_NFT_TYPE ||
              nft.collection.includes('azur_guardians') ||
              nft.collection.includes(AZUR_GUARDIANS_PACKAGE_ID)
            )
          );
          
          
          nftObjects = azurNfts.map((nft: any) => ({
            id: nft.objectId,
            name: nft.name || 'Azur Guardian',
            description: nft.description || '',
            imageUrl: nft.image?.startsWith('ipfs://') 
              ? `https://ipfs.io/ipfs/${nft.image.slice(7)}`
              : nft.image || '',
            collection: nft.collection,
            owner: walletAddress,
            isInKiosk: true,
            kioskId: nft.kioskId,
            location: 'kiosk' as const
          }));
        }
      }
    } catch (error) {
      console.error('BlockVision API error:', error);
    }
    
    // Skip direct RPC call if we already found NFTs in kiosks to avoid CORS delays
    if (nftObjects.length > 0) {
    } else {
      // Only try direct RPC if no NFTs found in kiosks
      try {
        // Add a timeout to prevent long waits on CORS failures
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Direct RPC timeout')), 3000)
        );
        
        const ownedObjects = await Promise.race([
          this.suiClient.getOwnedObjects({
            owner: walletAddress,
            filter: { StructType: AZUR_GUARDIANS_NFT_TYPE },
            options: { showDisplay: true, showContent: true, showType: true },
          }),
          timeoutPromise
        ]) as any;
        
        let directNFTs = ownedObjects.data || [];
        
        // If no exact matches, try broader search
        if (directNFTs.length === 0) {
          const fallbackObjects = await this.suiClient.getOwnedObjects({
            owner: walletAddress,
            options: { showDisplay: true, showContent: true, showType: true },
          });
          
          const filtered = (fallbackObjects.data || []).filter((obj: any) => {
            const objType = obj.data?.type;
            return objType && (
              objType === AZUR_GUARDIANS_NFT_TYPE || 
              objType.includes('azur_guardians::Nft') || 
              objType.includes(AZUR_GUARDIANS_PACKAGE_ID)
            );
          });
          
          directNFTs = filtered;
        }
        
        
        // Add direct NFTs to results, avoiding duplicates
        directNFTs.forEach((nft: any) => {
          if (!nftObjects.find(obj => obj.id === nft.data?.objectId)) {
            const display = nft.data?.display?.data || nft.data?.display || {};
            const imgUrl = display.image_url || display.image || '';
            nftObjects.push({
              id: nft.data?.objectId,
              name: display.name || 'Azur Guardian',
              description: display.description || '',
              imageUrl: imgUrl.startsWith('ipfs://') 
                ? `https://ipfs.io/ipfs/${imgUrl.slice(7)}`
                : imgUrl,
              collection: nft.data?.type,
              owner: walletAddress,
              isInKiosk: false,
              location: 'wallet' as const
            });
          }
        });
        
      } catch (error) {
        console.error('Error fetching directly owned NFTs:', error);
      }
    }
    
    return nftObjects;
  }

  /**
   * Check if a wallet owns any Azur Guardian NFTs
   * @param walletAddress The wallet address to check
   * @returns Boolean indicating if the wallet owns any Azur Guardian NFTs
   */
  async hasAzurGuardianNFTs(walletAddress: string): Promise<boolean> {
    const nfts = await this.getWalletAzurGuardianNFTs(walletAddress);
    return nfts.length > 0;
  }

  /**
   * Verify that a specific NFT is an Azur Guardian NFT
   * @param nftId The NFT object ID to verify
   * @returns Boolean indicating if the NFT is an Azur Guardian NFT
   */
  async isAzurGuardianNFT(nftId: string): Promise<boolean> {
    try {
      const objectData = await this.suiClient.getObject({
        id: nftId,
        options: {
          showType: true,
        }
      });
      
      if (!objectData.data?.type) return false;
      
      return objectData.data.type === AZUR_GUARDIANS_NFT_TYPE ||
             objectData.data.type.includes('azur_guardians') ||
             objectData.data.type.includes(AZUR_GUARDIANS_PACKAGE_ID);
    } catch (error) {
      console.error('Error verifying Azur Guardian NFT:', error);
      return false;
    }
  }
}

// Export a singleton instance for use throughout the app
export const azurGuardianService = new AzurGuardianService();