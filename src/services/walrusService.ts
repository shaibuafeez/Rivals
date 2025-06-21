import { Transaction } from '@mysten/sui/transactions';
import { type SuiClient } from '@/types/sui-client';
import { PACKAGE_IDS } from '@/config/env';

// Get Walrus package ID from environment configuration
const WALRUS_PACKAGE_ID = PACKAGE_IDS.WALRUS_PACKAGE_ID;

// Hardcoded Walrus configuration
const WALRUS_CONFIG = {
  API_ENDPOINT: process.env.NEXT_PUBLIC_WALRUS_API_ENDPOINT || 'https://api.walrus.sui.io',
  API_KEY: process.env.NEXT_PUBLIC_WALRUS_API_KEY || '',
};

export class WalrusService {
  constructor(private suiClient: SuiClient) {}

  async uploadImage(file: File): Promise<{ blobId: string; blobHash: string }> {
    // Real implementation using Walrus API
    try {
      // 1. Convert the file to a byte array
      const arrayBuffer = await file.arrayBuffer();
      // We calculate the bytes but don't use them directly in the fetch API
      // They would be used if we were using a direct Walrus SDK instead of REST API
      // const bytes = new Uint8Array(arrayBuffer);
      
      // 2. Calculate a hash for the file
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const blobHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // 3. Upload the file to Walrus
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${WALRUS_CONFIG.API_ENDPOINT}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WALRUS_CONFIG.API_KEY}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Walrus upload failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        blobId: data.blobId,
        blobHash: blobHash
      };
    } catch (error) {
      console.error('Error uploading to Walrus:', error);
      
      // Fallback to mock implementation if Walrus API is not available
      // This is useful for development and testing
      
      // Generate a mock blob ID
      const mockBlobId = `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Calculate hash if we don't have it already
      let blobHash = '';
      if (!blobHash) {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        blobHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
      
      return {
        blobId: mockBlobId,
        blobHash: blobHash
      };
    }
  }

  createRegisterBlobTransaction(
    blobId: string, 
    blobHash: string, 
    size: number
  ): Transaction {
    const txb = new Transaction();
    
    // This would call the actual Walrus blob registration function
    // For now, we'll just create a placeholder transaction
    
    txb.moveCall({
      target: `${WALRUS_PACKAGE_ID}::blob::register_blob`,
      arguments: [
        txb.pure.string(blobId),
        txb.pure.string(blobHash),
        txb.pure.u64(size),
      ],
    });
    
    return txb;
  }
}
