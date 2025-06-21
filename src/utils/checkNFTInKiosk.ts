import { SuiClient } from '@mysten/sui/client';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { useState, useEffect } from 'react';

export interface KioskNFTCheckResult {
  found: boolean;
  isInKiosk: boolean;
  kioskId?: string;
  objectId?: string;
  error?: string;
}

/**
 * Check if a specific NFT exists in the connected wallet (including kiosks)
 * @param walletAddress - The wallet address to check
 * @param targetNFTId - The specific NFT object ID to look for
 * @param targetNFTType - Optional: The NFT type to verify (e.g., "0xabc...::collection::NFT")
 * @returns Object indicating if NFT was found and where
 */
export async function checkSpecificNFTInWallet(
  walletAddress: string,
  targetNFTId: string,
  targetNFTType?: string,
  suiClient?: SuiClient
): Promise<KioskNFTCheckResult> {
  // BlockVision API configuration
  const BLOCKVISION_API_KEY = process.env.NEXT_PUBLIC_BLOCKVISION_API_KEY || '';
  
  // Create SUI client if not provided
  const client = suiClient || new SuiClient({ 
    url: process.env.NEXT_PUBLIC_SUI_RPC_URL || 'https://fullnode.mainnet.sui.io:443' 
  });

  try {
    // Normalize the addresses
    const normalizedWallet = normalizeSuiAddress(walletAddress);
    const normalizedNFTId = normalizeSuiAddress(targetNFTId);


    // Step 1: Check kiosks using BlockVision API
    if (BLOCKVISION_API_KEY) {
      try {
        const url = new URL('https://api.blockvision.org/v2/sui/account/nfts');
        url.searchParams.append('account', normalizedWallet);
        url.searchParams.append('type', 'kiosk');
        url.searchParams.append('pageIndex', '1');
        url.searchParams.append('pageSize', '100'); // Increase page size to check more NFTs

        const headers = {
          'accept': 'application/json',
          'x-api-key': BLOCKVISION_API_KEY
        };

        const response = await fetch(url.toString(), { headers });

        if (response.ok) {
          const result = await response.json();
          
          if (result.code === 200 && result.result?.data) {
            const nfts = result.result.data;
            
            // Look for our specific NFT
            const foundNFT = nfts.find((nft: any) => 
              normalizeSuiAddress(nft.objectId) === normalizedNFTId
            );

            if (foundNFT) {
              // Verify type if provided
              if (targetNFTType && foundNFT.collection !== targetNFTType) {
                return {
                  found: false,
                  isInKiosk: false,
                  error: 'NFT type mismatch'
                };
              }

              return {
                found: true,
                isInKiosk: true,
                kioskId: foundNFT.kioskId,
                objectId: foundNFT.objectId
              };
            }
          }
        }
      } catch (apiError) {
      }
    }

    // Step 2: Check direct ownership
    try {
      // Check if the NFT is directly owned
      const objectResponse = await client.getObject({
        id: normalizedNFTId,
        options: {
          showOwner: true,
          showType: true
        }
      });

      if (objectResponse.data?.owner) {
        // Check if it's owned by an address
        if (typeof objectResponse.data.owner === 'object' && 'AddressOwner' in objectResponse.data.owner && 
            objectResponse.data.owner.AddressOwner === normalizedWallet) {
          
          // Verify type if provided
          if (targetNFTType && objectResponse.data.type !== targetNFTType) {
            return {
              found: false,
              isInKiosk: false,
              error: 'NFT type mismatch'
            };
          }

          return {
            found: true,
            isInKiosk: false,
            objectId: normalizedNFTId
          };
        }

        // Check if it's in a shared object (could be a kiosk)
        if (typeof objectResponse.data.owner === 'object' && 'Shared' in objectResponse.data.owner) {
          // Additional check: see if this wallet has access via kiosk caps
          const ownedObjects = await client.getOwnedObjects({
            owner: normalizedWallet,
            filter: { StructType: '0x2::kiosk::KioskOwnerCap' },
            options: { showContent: true }
          });

          // Check each kiosk cap to see if it manages our NFT
          for (const cap of ownedObjects.data) {
            if (cap.data?.content && 'fields' in cap.data.content) {
              const kioskId = (cap.data.content as any).fields?.for;
              
              if (kioskId) {
                // Check if our NFT is in this kiosk
                try {
                  const dynamicFields = await client.getDynamicFields({
                    parentId: kioskId,
                    limit: 1000
                  });

                  const hasNFT = dynamicFields.data.some(field => {
                    // Check if this is an Item field
                    if (!field.name?.type?.includes('0x2::kiosk::Item')) {
                      return false;
                    }
                    
                    // Extract the NFT ID from the Item field
                    // The Item type includes the NFT ID in its value
                    if (field.name?.value && typeof field.name.value === 'object') {
                      const itemId = (field.name.value as any).id;
                      return itemId && normalizeSuiAddress(itemId) === normalizedNFTId;
                    }
                    
                    return false;
                  });

                  if (hasNFT) {
                    return {
                      found: true,
                      isInKiosk: true,
                      kioskId: kioskId,
                      objectId: normalizedNFTId
                    };
                  }
                } catch (e) {
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking direct ownership:', error);
    }

    // NFT not found
    return {
      found: false,
      isInKiosk: false
    };

  } catch (error) {
    console.error('Error checking NFT in wallet:', error);
    return {
      found: false,
      isInKiosk: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * React Hook to check if a specific NFT exists in the connected wallet
 */
export function useCheckSpecificNFT(
  walletAddress: string | undefined,
  nftId: string | undefined,
  nftType?: string
) {
  const [result, setResult] = useState<KioskNFTCheckResult & { loading: boolean }>({
    found: false,
    isInKiosk: false,
    loading: true
  });

  useEffect(() => {
    if (!walletAddress || !nftId) {
      setResult({ found: false, isInKiosk: false, loading: false });
      return;
    }

    let cancelled = false;

    checkSpecificNFTInWallet(walletAddress, nftId, nftType)
      .then(res => {
        if (!cancelled) {
          setResult({ ...res, loading: false });
        }
      })
      .catch(err => {
        if (!cancelled) {
          setResult({ 
            found: false, 
            isInKiosk: false, 
            loading: false,
            error: err.message 
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [walletAddress, nftId, nftType]);

  return result;
}

/**
 * Check if wallet has access to multiple NFTs
 */
export async function checkMultipleNFTsInWallet(
  walletAddress: string,
  nftIds: string[],
  targetNFTType?: string,
  suiClient?: SuiClient
): Promise<Map<string, KioskNFTCheckResult>> {
  const results = new Map<string, KioskNFTCheckResult>();
  
  // Check all NFTs in parallel for better performance
  const promises = nftIds.map(async (nftId) => {
    const result = await checkSpecificNFTInWallet(walletAddress, nftId, targetNFTType, suiClient);
    return { nftId, result };
  });
  
  const checkResults = await Promise.all(promises);
  
  checkResults.forEach(({ nftId, result }) => {
    results.set(nftId, result);
  });
  
  return results;
}