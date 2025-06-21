import { SuiClient } from '@mysten/sui/client';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { ObjectOwner } from '@mysten/sui/client';
import { KioskClient, Network } from '@mysten/kiosk';

export interface NFTMetadata {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  collection?: string;
  attributes?: { [key: string]: string };
  owner: string;
  location?: 'wallet' | 'kiosk';
  kioskId?: string;
  isListed?: boolean;
  price?: string;
}

// Define the Kiosk NFT interface
export interface KioskNFT extends NFTMetadata {
  kioskId: string;
  kioskOwner: string;
  isListed: boolean;
  price?: string;
}

export class NFTService {
  private suiClient: SuiClient;
  private AZUR_GUARDIAN_TYPE = '0xfc9d0c6972cae3f303030b993485af37e2d86ebf3b409d1e6a40cde955a43a77::azur_guardians::Nft';
  private BLOCKVISION_API_KEY = process.env.NEXT_PUBLIC_BLOCKVISION_API_KEY || '';

  constructor(suiClient?: unknown) {
    // If no client provided or if it's from dapp-kit, create a new SuiClient
    if (!suiClient || !this.isSuiJsClient(suiClient)) {
      // Use proxy to avoid CORS issues in browser
      const rpcUrl = '/api/sui-proxy';
      this.suiClient = new SuiClient({ url: rpcUrl });
    } else {
      this.suiClient = suiClient;
    }
  }
  
  // Helper method to check if the client is a SuiClient from @mysten/sui
  private isSuiJsClient(client: unknown): client is SuiClient {
    return Boolean(
      client && 
      typeof client === 'object' && 
      client !== null && 
      'getObject' in client && 
      typeof (client as Record<string, unknown>).getObject === 'function' && 
      'getOwnedObjects' in client && 
      typeof (client as Record<string, unknown>).getOwnedObjects === 'function'
    );
  }
  
  /**
   * Fetch Azur Guardian NFTs from kiosks for a specific wallet address
   * @param walletAddress The wallet address to fetch NFTs for
   * @returns Array of Azur Guardian NFTs in kiosks
   */
  async fetchAzurGuardianNFTsFromKiosk(walletAddress: string): Promise<KioskNFT[]> {
    try {
      // First try BlockVision API if API key is available
      if (this.BLOCKVISION_API_KEY) {
        const nfts = await this.fetchNFTsWithBlockVision(walletAddress);
        if (nfts.length > 0) {
          return nfts;
        }
      }
      
      // Fallback to SuiVision API
      const nfts = await this.fetchNFTsWithSuiVision(walletAddress);
      return nfts;
    } catch (error) {
      console.error('Error fetching Azur Guardian NFTs from kiosk:', error);
      return [];
    }
  }
  
  /**
   * Fetch NFTs from kiosks using BlockVision API
   * @param walletAddress The wallet address to fetch NFTs for
   * @returns Array of Azur Guardian NFTs in kiosks
   */
  private async fetchNFTsWithBlockVision(walletAddress: string): Promise<KioskNFT[]> {
    try {
      
      // Construct URL with parameters
      const url = new URL('https://api.blockvision.org/v2/sui/account/nfts');
      url.searchParams.append('account', walletAddress);
      url.searchParams.append('type', 'kiosk'); // Specifically request kiosk NFTs
      url.searchParams.append('pageIndex', '1');
      url.searchParams.append('pageSize', '50');
      
      const headers = {
        'accept': 'application/json',
        'x-api-key': this.BLOCKVISION_API_KEY
      };
      
      const response = await fetch(url.toString(), { headers });
      
      if (!response.ok) {
        throw new Error(`BlockVision API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.code !== 200) {
        throw new Error(`BlockVision API error: ${result.message}`);
      }
      
      const nfts = result.result.data || [];
      
      // Filter for Azur Guardian NFTs
      const azurNfts = nfts.filter((nft: any) => 
        nft.collection && (
          nft.collection === this.AZUR_GUARDIAN_TYPE ||
          nft.collection.toLowerCase().includes('azur_guardians')
        )
      );
      
      
      // Transform to our KioskNFT format
      return azurNfts.map((nft: any) => ({
        id: nft.objectId,
        name: nft.name || `Azur Guardian #${nft.objectId.substring(0, 6)}`,
        description: nft.description || 'An Azur Guardian NFT',
        imageUrl: nft.imageUrl || `/images/avatars/telegram-cloud-photo-size-1-5037512497065733520-y.jpg`,
        collection: nft.collection,
        attributes: nft.attributes || {},
        owner: walletAddress,
        kioskId: nft.kioskId,
        kioskOwner: nft.kioskOwner || walletAddress,
        isListed: !!nft.isListed,
        price: nft.price
      }));
    } catch (error) {
      console.error(`Error fetching NFTs with BlockVision: ${error}`);
      return [];
    }
  }
  
  /**
   * Fetch NFTs from kiosks using SuiVision API
   * @param walletAddress The wallet address to fetch NFTs for
   * @returns Array of Azur Guardian NFTs in kiosks
   */
  private async fetchNFTsWithSuiVision(walletAddress: string): Promise<KioskNFT[]> {
    try {
      
      // First get all objects owned by the wallet
      const url = `https://api.suivision.xyz/api/wallet/objects?address=${walletAddress}&limit=50`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`SuiVision API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`SuiVision API returned error: ${data.message || 'Unknown error'}`);
      }
      
      
      // Look for kiosk caps
      const kioskCaps = data.data.objects.filter((obj: any) => 
        obj.type && (
          obj.type.includes('kiosk') || 
          obj.type.includes('Kiosk')
        ) && obj.type.includes('Cap')
      );
      
      
      // Get kiosk IDs
      const kioskIds: string[] = [];
      for (const cap of kioskCaps) {
        // Get object details
        const objUrl = `https://api.suivision.xyz/api/object/${cap.objectId}`;
        const objResponse = await fetch(objUrl);
        
        if (!objResponse.ok) {
          continue;
        }
        
        const objData = await objResponse.json();
        
        if (!objData.success) {
          continue;
        }
        
        // Look for kiosk ID in fields
        if (objData.data.content?.fields) {
          // Check for standard kiosk owner cap
          if (objData.data.content.fields.for && typeof objData.data.content.fields.for === 'string') {
            kioskIds.push(objData.data.content.fields.for);
          }
          
          // Check for nested kiosk owner cap
          if (objData.data.content.fields.cap?.fields?.for && 
              typeof objData.data.content.fields.cap.fields.for === 'string') {
            kioskIds.push(objData.data.content.fields.cap.fields.for);
          }
        }
      }
      
      
      // Get NFTs from each kiosk
      const allNfts: KioskNFT[] = [];
      
      for (const kioskId of kioskIds) {
        // Get dynamic fields
        const dynamicFieldsUrl = `https://api.suivision.xyz/api/object/${kioskId}/dynamic-fields`;
        const dynamicFieldsResponse = await fetch(dynamicFieldsUrl);
        
        if (!dynamicFieldsResponse.ok) {
          continue;
        }
        
        const dynamicFieldsData = await dynamicFieldsResponse.json();
        
        if (!dynamicFieldsData.success) {
          continue;
        }
        
        // Find items in the kiosk
        const items = dynamicFieldsData.data.filter((field: any) => 
          field.name?.type === '0x2::kiosk::Item' || 
          (field.name?.type && field.name.type.includes('Item'))
        );
        
        
        // Check each item
        for (const item of items) {
          if (!item.objectId) continue;
          
          // Get object details
          const objUrl = `https://api.suivision.xyz/api/object/${item.objectId}`;
          const objResponse = await fetch(objUrl);
          
          if (!objResponse.ok) {
            continue;
          }
          
          const objData = await objResponse.json();
          
          if (!objData.success || !objData.data) {
            continue;
          }
          
          // Check if it's an Azur Guardian NFT
          const objectType = objData.data.type;
          if (objectType && (
            objectType === this.AZUR_GUARDIAN_TYPE ||
            objectType.toLowerCase().includes('azur_guardians')
          )) {
            // Get display data
            const displayUrl = `https://api.suivision.xyz/api/object/${item.objectId}/display`;
            const displayResponse = await fetch(displayUrl);
            
            let name = `Azur Guardian #${item.objectId.substring(0, 6)}`;
            let description = 'An Azur Guardian NFT';
            let imageUrl = `/images/avatars/telegram-cloud-photo-size-1-5037512497065733520-y.jpg`;
            
            if (displayResponse.ok) {
              const displayData = await displayResponse.json();
              if (displayData.success && displayData.data) {
                name = displayData.data.name || name;
                description = displayData.data.description || description;
                imageUrl = displayData.data.image_url || imageUrl;
              }
            }
            
            // Get listing info
            const listingFieldUrl = `https://api.suivision.xyz/api/object/${kioskId}/dynamic-field/0x2::kiosk::Listing<${objectType}>${item.objectId}`;
            const listingResponse = await fetch(listingFieldUrl);
            
            let isListed = false;
            let price = undefined;
            
            if (listingResponse.ok) {
              const listingData = await listingResponse.json();
              if (listingData.success && listingData.data && listingData.data.content?.fields) {
                isListed = true;
                price = listingData.data.content.fields.price;
              }
            }
            
            // Add to results
            allNfts.push({
              id: item.objectId,
              name,
              description,
              imageUrl,
              collection: objectType,
              owner: walletAddress,
              kioskId,
              kioskOwner: walletAddress,
              isListed,
              price
            });
          }
        }
      }
      
      return allNfts;
    } catch (error) {
      console.error(`Error fetching NFTs with SuiVision: ${error}`);
      return [];
    }
  }

  /**
   * Check if a wallet owns a specific NFT
   * @param walletAddress The wallet address to check
   * @param nftId The NFT object ID to verify ownership of
   * @returns Boolean indicating if the wallet owns the NFT
   */
  async checkNFTOwnership(walletAddress: string, nftId: string): Promise<boolean> {
    try {
      // Normalize the wallet address to ensure correct format
      const normalizedAddress = normalizeSuiAddress(walletAddress);
      
      // Get the NFT object data
      const objectData = await this.suiClient.getObject({
        id: nftId,
        options: {
          showOwner: true,
        }
      });
      
      // Check if the object exists and is owned by the wallet
      if (objectData && objectData.data && objectData.data.owner) {
        const ownerData = objectData.data.owner as ObjectOwner;
        
        // Check if it's an AddressOwner type and matches the wallet address
        if (typeof ownerData === 'object' && 'AddressOwner' in ownerData) {
          return ownerData.AddressOwner === normalizedAddress;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking NFT ownership:', error);
      return false;
    }
  }

  /**
   * Get NFT metadata from an object ID
   * @param nftId The NFT object ID
   * @returns NFT metadata including image URL
   */
  async getNFTMetadata(nftId: string): Promise<NFTMetadata | null> {
    try {
      // Get the NFT object data with all fields
      const objectData = await this.suiClient.getObject({
        id: nftId,
        options: {
          showContent: true,
          showOwner: true,
          showDisplay: true,
        }
      });
      
      if (!objectData.data) {
        console.error('NFT object not found:', nftId);
        return null;
      }
      
      // Extract owner
      let owner = '';
      if (objectData.data.owner) {
        const ownerData = objectData.data.owner as ObjectOwner;
        if (typeof ownerData === 'object' && 'AddressOwner' in ownerData) {
          owner = ownerData.AddressOwner;
        }
      }
      
      // Extract display data (name, description, image URL)
      const display = objectData.data.display;
      if (!display) {
        console.error('NFT has no display data:', nftId);
        return null;
      }
      
      // Extract content data for additional attributes
      const content = objectData.data.content;
      const attributes: { [key: string]: string } = {};
      
      // If there are fields in the content, extract them as attributes
      if (content && typeof content === 'object' && 'fields' in content) {
        const fields = content.fields as Record<string, unknown>;
        // Add all fields as attributes
        Object.entries(fields).forEach(([key, value]) => {
          if (typeof value === 'string') {
            attributes[key] = value;
          } else if (value && typeof value === 'object' && 'fields' in (value as Record<string, unknown>)) {
            // Handle nested fields
            const nestedFields = (value as Record<string, unknown>).fields as Record<string, unknown>;
            Object.entries(nestedFields).forEach(([nestedKey, nestedValue]) => {
              if (typeof nestedValue === 'string') {
                attributes[`${key}_${nestedKey}`] = nestedValue;
              }
            });
          }
        });
      }
      
      // Extract display fields safely
      const displayData = display as Record<string, unknown>;
      
      return {
        id: nftId,
        name: (displayData.name as string | undefined)?.toString() || 'Unnamed NFT',
        description: (displayData.description as string | undefined)?.toString() || '',
        imageUrl: (displayData.image_url as string | undefined)?.toString() || '',
        collection: typeof displayData.collection === 'object' && displayData.collection !== null
          ? ((displayData.collection as Record<string, unknown>).name as string | undefined)?.toString()
          : undefined,
        attributes,
        owner
      };
    } catch (error) {
      console.error('Error getting NFT metadata:', error);
      return null;
    }
  }

  /**
   * Get all NFTs owned by a wallet address
   * @param walletAddress The wallet address to check
   * @returns Array of NFT object IDs owned by the wallet
   */
  async getWalletNFTs(walletAddress: string): Promise<string[]> {
    try {
      // Normalize the wallet address
      const normalizedAddress = normalizeSuiAddress(walletAddress);
      
      // Get all objects owned by the wallet with display data
      const objects = await this.suiClient.getOwnedObjects({
        owner: normalizedAddress,
        options: {
          showType: true,
          showDisplay: true,
          showContent: true,
        },
        // Fetch more objects to ensure we don't miss any NFTs
        limit: 50
      });
      
      // Filter for NFT objects based on multiple criteria
      const nftIds: string[] = [];
      
      for (const object of objects.data) {
        if (!object.data || !object.data.objectId) continue;
        
        // Check if it has display data (a strong indicator it's an NFT)
        const hasDisplayData = object.data.display !== undefined;
        
        // Check type patterns common for NFTs
        const typePatterns = ['::nft::', '::NFT::', '::Nft::', 'Collection', 'collection', 'Token', 'token'];
        const matchesTypePattern = object.data?.type && 
          typePatterns.some(pattern => object.data?.type?.includes(pattern) || false);
        
        // Check content fields that might indicate it's an NFT
        const hasNFTContent = object.data?.content && 
          typeof object.data.content === 'object' && 
          ('fields' in object.data.content) && 
          object.data.content.fields && 
          (('name' in object.data.content.fields) || 
           ('url' in object.data.content.fields) || 
           ('image' in object.data.content.fields));
        
        // If it matches any of our criteria, consider it an NFT
        if (hasDisplayData || matchesTypePattern || hasNFTContent) {
          nftIds.push(object.data.objectId);
        }
      }
      
      return nftIds;
    } catch (error) {
      console.error('Error getting wallet NFTs:', error);
      return [];
    }
  }

  /**
   * Check if a wallet has any NFT from a specific collection
   * @param walletAddress The wallet address to check
   * @param collectionId The collection ID to check against
   * @returns Boolean indicating if the wallet has any NFT from the collection
   */
  async hasNFTFromCollection(walletAddress: string, collectionId: string): Promise<boolean> {
    try {
      // Get all NFTs owned by the wallet
      const nftIds = await this.getWalletNFTs(walletAddress);
      
      // Check each NFT to see if it belongs to the collection
      for (const nftId of nftIds) {
        const metadata = await this.getNFTMetadata(nftId);
        if (metadata && metadata.collection === collectionId) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking collection ownership:', error);
      return false;
    }
  }

  /**
   * Get all NFTs owned by a user (including those in kiosks)
   * @param walletAddress The wallet address to fetch NFTs for
   * @param includeKiosks Whether to include NFTs in kiosks
   * @returns Array of NFTMetadata for all user NFTs
   */
  async getUserNFTs(walletAddress: string, includeKiosks: boolean = true): Promise<NFTMetadata[]> {
    const foundNFTs: NFTMetadata[] = [];

    try {
      
      // Fetch all owned objects with pagination
      let cursor: string | null = null;
      let totalObjects = 0;
      
      // Fetch wallet NFTs
      for (let page = 0; page < 20; page++) { // Check up to 1000 objects
        try {
          const response = await this.suiClient.getOwnedObjects({
            owner: walletAddress,
            cursor,
            options: {
              showType: true,
              showDisplay: true,
              showContent: true,
            },
            limit: 50
          });

          totalObjects += response.data.length;

          // Process each object
          for (const obj of response.data) {
            try {
              // Check if it has display data (likely an NFT)
              if (obj.data?.display?.data) {
                const display = obj.data.display.data;
                
                // Only add if it has at least a name or image
                if (display.name || display.image_url) {
                  const type = obj.data.type || 'Unknown';
                  const collection = type.split('::').slice(0, -1).join('::');
                  
                  foundNFTs.push({
                    id: obj.data.objectId,
                    name: display.name || 'Unnamed NFT',
                    description: display.description || '',
                    imageUrl: display.image_url || '',
                    collection: collection,
                    owner: walletAddress,
                    location: 'wallet'
                  });
                }
              }
            } catch (objError) {
              console.error('Error processing object:', objError);
            }
          }

          if (!response.hasNextPage) {
            break;
          }
          cursor = response.nextCursor || null;
        } catch (pageError) {
          console.error(`Error fetching page ${page + 1}:`, pageError);
          break;
        }
      }

      
      // Note: Kiosk NFTs are handled separately via BlockVision API in azurGuardianService
      // to avoid CORS issues when calling Sui RPC directly from browser
      if (includeKiosks) {
      }
      
      // Sort NFTs by location then collection
      foundNFTs.sort((a, b) => {
        if (a.location !== b.location) {
          return a.location === 'wallet' ? -1 : 1;
        }
        return (a.collection || '').localeCompare(b.collection || '');
      });
      
      return foundNFTs;
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      return [];
    }
  }
}
