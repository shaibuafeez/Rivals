import { checkSpecificNFTInWallet, useCheckSpecificNFT, checkMultipleNFTsInWallet } from './checkNFTInKiosk';
import { SuiClient } from '@mysten/sui/client';

// Azur Guardian NFT type constant - same as in the smart contract
export const AZUR_GUARDIAN_NFT_TYPE = process.env.NEXT_PUBLIC_AZUR_GUARDIAN_NFT_TYPE!;

/**
 * Check if a wallet owns a specific Azur Guardian NFT
 * @param walletAddress The wallet address to check
 * @param nftId The Azur Guardian NFT ID
 * @param suiClient Optional SUI client instance
 * @returns Ownership status with location details
 */
export async function checkAzurGuardianNFT(
  walletAddress: string,
  nftId: string,
  suiClient?: SuiClient
) {
  return checkSpecificNFTInWallet(
    walletAddress,
    nftId,
    AZUR_GUARDIAN_NFT_TYPE, // Always verify it's an Azur Guardian
    suiClient
  );
}

/**
 * React hook to check Azur Guardian NFT ownership
 * @param walletAddress The wallet address
 * @param nftId The NFT ID to check
 * @returns Ownership status with loading state
 */
export function useCheckAzurGuardianNFT(
  walletAddress: string | undefined,
  nftId: string | undefined
) {
  return useCheckSpecificNFT(
    walletAddress,
    nftId,
    AZUR_GUARDIAN_NFT_TYPE
  );
}

/**
 * Check multiple Azur Guardian NFTs at once
 * @param walletAddress The wallet address
 * @param nftIds Array of Azur Guardian NFT IDs
 * @param suiClient Optional SUI client
 * @returns Map of NFT IDs to ownership results
 */
export async function checkMultipleAzurGuardianNFTs(
  walletAddress: string,
  nftIds: string[],
  suiClient?: SuiClient
) {
  return checkMultipleNFTsInWallet(
    walletAddress,
    nftIds,
    AZUR_GUARDIAN_NFT_TYPE,
    suiClient
  );
}

/**
 * Get all Azur Guardian NFTs owned by a wallet (including in kiosks)
 * This uses the BlockVision API to fetch all NFTs and filter for Azur Guardians
 */
export async function getAllAzurGuardianNFTs(
  walletAddress: string
): Promise<Array<{
  objectId: string;
  isInKiosk: boolean;
  kioskId?: string;
}>> {
  const BLOCKVISION_API_KEY = process.env.NEXT_PUBLIC_BLOCKVISION_API_KEY!;
  
  try {
    // Fetch from BlockVision API
    const url = new URL('https://api.blockvision.org/v2/sui/account/nfts');
    url.searchParams.append('account', walletAddress);
    url.searchParams.append('type', 'kiosk');
    url.searchParams.append('pageIndex', '1');
    url.searchParams.append('pageSize', '100');
    
    const headers = {
      'accept': 'application/json',
      'x-api-key': BLOCKVISION_API_KEY
    };
    
    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      throw new Error(`BlockVision API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.code !== 200 || !result.result?.data) {
      return [];
    }
    
    // Filter for Azur Guardian NFTs
    const azurGuardianNFTs = result.result.data
      .filter((nft: any) => nft.collection === AZUR_GUARDIAN_NFT_TYPE)
      .map((nft: any) => ({
        objectId: nft.objectId,
        isInKiosk: true,
        kioskId: nft.kioskId
      }));
    
    return azurGuardianNFTs;
  } catch (error) {
    console.error('Error fetching Azur Guardian NFTs:', error);
    return [];
  }
}

/**
 * Check if a wallet owns ANY Azur Guardian NFT
 */
export async function hasAnyAzurGuardianNFT(
  walletAddress: string
): Promise<boolean> {
  const nfts = await getAllAzurGuardianNFTs(walletAddress);
  return nfts.length > 0;
}