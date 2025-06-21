import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { SuiTransactionBlockResponse } from '@mysten/sui/client';
import { executeWithRetry } from './retry';
import toast from 'react-hot-toast';

// Get package IDs from environment variables
const TOURNAMENT_PACKAGE_ID = process.env.NEXT_PUBLIC_TOURNAMENT_PACKAGE_ID || '0x0';
const TOURNAMENT_REGISTRY_ID = process.env.NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID || '0x0';

/**
 * Extracts the registry ID from a transaction response
 * @param txResponse The transaction response from creating a registry
 * @returns The extracted registry ID or null if not found
 */
export function extractRegistryIdFromTransaction(txResponse: SuiTransactionBlockResponse): string | null {
  try {
    // Check if the transaction was successful
    if (txResponse.effects?.status?.status !== 'success') {
      console.error('Transaction failed:', txResponse.effects?.status);
      return null;
    }
    
    // Look for created objects
    const createdObjects = txResponse.effects?.created || [];
    if (createdObjects.length === 0) {
      console.error('No objects created in transaction');
      return null;
    }
    
    // Find the registry object (typically the first created object)
    // You might need to adjust this logic based on your specific contract
    const registryObject = createdObjects[0];
    if (!registryObject?.reference?.objectId) {
      console.error('Could not find registry object ID in transaction response');
      return null;
    }
    
    return registryObject.reference.objectId;
  } catch (error) {
    console.error('Error extracting registry ID from transaction:', error);
    return null;
  }
}

/**
 * Checks if a registry exists and creates one if it doesn't
 * @param suiClient The Sui client instance
 * @param executeTransaction Function to execute a transaction
 * @returns The registry ID (either existing or newly created)
 */
export async function ensureRegistryExists(
  suiClient: SuiClient, 
  executeTransaction: (txb: Transaction) => Promise<SuiTransactionBlockResponse>
): Promise<string> {
  
  // First check if the registry ID is valid
  if (!TOURNAMENT_REGISTRY_ID || TOURNAMENT_REGISTRY_ID === '0x0' || !TOURNAMENT_REGISTRY_ID.startsWith('0x')) {
    toast.error('Invalid registry ID in environment variables. Creating a new registry...', { id: 'registry-check' });
    return await createNewRegistry(suiClient, executeTransaction);
  }
  
  try {
    // Try to fetch the registry to see if it exists
    toast.loading('Checking if tournament registry exists...', { id: 'registry-check' });
    
    const registryResponse = await executeWithRetry(
      () => suiClient.getObject({
        id: TOURNAMENT_REGISTRY_ID,
        options: { showContent: true }
      }),
      2 // max retries
    );
    
    // Check if registry exists and is accessible
    if (registryResponse && 'data' in registryResponse && registryResponse.data && 'content' in registryResponse.data) {
      toast.success('Tournament registry found', { id: 'registry-check' });
      return TOURNAMENT_REGISTRY_ID;
    }
    
    toast.error('Registry not found. Creating a new registry...', { id: 'registry-check' });
    return await createNewRegistry(suiClient, executeTransaction);
  } catch (error) {
    console.error('Error checking registry existence:', error);
    toast.error('Error checking registry. Creating a new registry...', { id: 'registry-check' });
    return await createNewRegistry(suiClient, executeTransaction);
  }
}

/**
 * Creates a new tournament registry
 * @param suiClient The Sui client instance
 * @param executeTransaction Function to execute a transaction
 * @returns The newly created registry ID
 */
async function createNewRegistry(
  suiClient: SuiClient,
  executeTransaction: (txb: Transaction) => Promise<SuiTransactionBlockResponse>
): Promise<string> {
  // Check if package ID is valid
  if (!TOURNAMENT_PACKAGE_ID || TOURNAMENT_PACKAGE_ID === '0x0' || !TOURNAMENT_PACKAGE_ID.startsWith('0x')) {
    throw new Error('Invalid tournament package ID in environment variables');
  }
  
  // Creating new tournament registry...
  toast.loading('Creating new tournament registry...', { id: 'create-registry' });
  
  try {
    // Create the transaction block
    const txb = new Transaction();
    
    // Set gas budget
    txb.setGasBudget(200000000); // 0.2 SUI - increased to ensure enough gas
    
    // Call the tournament registry creation function
    txb.moveCall({
      target: `${TOURNAMENT_PACKAGE_ID}::tournament::create_tournament_registry`,
      arguments: [],
    });
    
    // Execute the transaction
    const result = await executeTransaction(txb);
    
    // Extract the registry ID
    const newRegistryId = extractRegistryIdFromTransaction(result);
    
    if (!newRegistryId) {
      throw new Error('Failed to extract registry ID from transaction');
    }
    
    // New tournament registry created: newRegistryId
    toast.success(`New tournament registry created: ${newRegistryId.substring(0, 10)}...`, { id: 'create-registry' });
    
    // Alert the user to update their .env.local file
    toast.success(
      'Please update your .env.local file with the new registry ID',
      { id: 'update-env', duration: 10000 }
    );
    
    return newRegistryId;
  } catch (error) {
    console.error('Error creating new registry:', error);
    toast.error('Failed to create tournament registry', { id: 'create-registry' });
    throw error;
  }
}
