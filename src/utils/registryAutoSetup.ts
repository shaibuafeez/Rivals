import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = process.env.NEXT_PUBLIC_TOURNAMENT_PACKAGE_ID || '0x203bbd21feeaa6ea6ea756e83548de6a54ed6ac6c29e5dbbfdfe026d5b44858d';

interface RegistrySearchResult {
  found: boolean;
  registryId?: string;
  needsCreation: boolean;
  error?: string;
}

/**
 * Automatically find or create a TournamentRegistry
 */
export async function autoSetupTournamentRegistry(
  suiClient: SuiClient,
  walletAddress: string
): Promise<RegistrySearchResult> {
  try {
    
    // Step 1: Check if we already have a valid TournamentRegistry
    const currentRegistryId = process.env.NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID;
    if (currentRegistryId) {
      const isValid = await verifyTournamentRegistry(suiClient, currentRegistryId);
      if (isValid) {
        return { found: true, registryId: currentRegistryId, needsCreation: false };
      }
    }
    
    // Step 2: Search for existing TournamentRegistry created by this wallet
    const existingRegistry = await findTournamentRegistry(suiClient, walletAddress);
    if (existingRegistry) {
      console.log(`✅ Found existing TournamentRegistry: ${existingRegistry}`);
      updateEnvFile(existingRegistry);
      return { found: true, registryId: existingRegistry, needsCreation: false };
    }
    
    // Step 3: Search for any shared TournamentRegistry
    console.log('🔎 Searching for any shared TournamentRegistry...');
    const sharedRegistry = await findSharedTournamentRegistry(suiClient);
    if (sharedRegistry) {
      console.log(`✅ Found shared TournamentRegistry: ${sharedRegistry}`);
      updateEnvFile(sharedRegistry);
      return { found: true, registryId: sharedRegistry, needsCreation: false };
    }
    
    // Step 4: No registry found, needs creation
    console.log('❌ No TournamentRegistry found. One needs to be created.');
    return { found: false, needsCreation: true };
    
  } catch (error) {
    console.error('Error in auto setup:', error);
    return { 
      found: false, 
      needsCreation: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Verify if an object is a TournamentRegistry
 */
async function verifyTournamentRegistry(
  suiClient: SuiClient, 
  objectId: string
): Promise<boolean> {
  try {
    const obj = await suiClient.getObject({
      id: objectId,
      options: { showType: true, showContent: true }
    });
    
    if (!obj.data) return false;
    
    // Check if the type matches TournamentRegistry
    const expectedType = `${PACKAGE_ID}::tournament::TournamentRegistry`;
    return obj.data.type === expectedType;
  } catch (error) {
    console.error(`Error verifying registry ${objectId}:`, error);
    return false;
  }
}

/**
 * Find TournamentRegistry created by a specific wallet
 */
async function findTournamentRegistry(
  suiClient: SuiClient,
  walletAddress: string
): Promise<string | null> {
  try {
    // Get objects owned by the wallet
    const { data } = await suiClient.getOwnedObjects({
      owner: walletAddress,
      options: { showType: true },
      limit: 50
    });
    
    // Look for TournamentRegistry type
    const expectedType = `${PACKAGE_ID}::tournament::TournamentRegistry`;
    const registry = data.find(obj => obj.data?.type === expectedType);
    
    if (registry?.data?.objectId) {
      return registry.data.objectId;
    }
    
    // Also check for created but shared registries by querying events
    // This requires looking at past transactions
    const txns = await suiClient.queryTransactionBlocks({
      filter: { FromAddress: walletAddress },
      options: { showEffects: true },
      limit: 50
    });
    
    for (const tx of txns.data) {
      if (tx.effects?.created) {
        for (const created of tx.effects.created) {
          if (created.reference?.objectId) {
            const isRegistry = await verifyTournamentRegistry(suiClient, created.reference.objectId);
            if (isRegistry) {
              return created.reference.objectId;
            }
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding registry:', error);
    return null;
  }
}

/**
 * Find any shared TournamentRegistry
 */
async function findSharedTournamentRegistry(
  suiClient: SuiClient
): Promise<string | null> {
  try {
    // Query for shared objects of TournamentRegistry type
    // Note: This is a simplified approach. In production, you might want to
    // maintain a list of known registry IDs or use an indexer
    
    // Try some common patterns for finding shared objects
    const possibleRegistries: string[] = [
      // Add any known registry IDs here
    ];
    
    for (const registryId of possibleRegistries) {
      const isValid = await verifyTournamentRegistry(suiClient, registryId);
      if (isValid) {
        return registryId;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding shared registry:', error);
    return null;
  }
}

/**
 * Update .env.local file with new registry ID (browser-side notification)
 */
function updateEnvFile(registryId: string): void {
  console.log(`
📝 Please update your .env.local file:
NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID="${registryId}"
  `);
  
  // Store in localStorage as backup
  if (typeof window !== 'undefined') {
    localStorage.setItem('TOURNAMENT_REGISTRY_ID', registryId);
  }
}

/**
 * Create a new TournamentRegistry
 */
export async function createTournamentRegistry(
  executeTransaction: (txb: Transaction) => Promise<any>
): Promise<string | null> {
  try {
    console.log('🏗️ Creating new TournamentRegistry...');
    
    const txb = new Transaction();
    txb.setGasBudget(50000000); // 0.05 SUI
    
    // Call create_tournament_registry function
    txb.moveCall({
      target: `${PACKAGE_ID}::tournament::create_tournament_registry`,
      arguments: [],
    });
    
    const result = await executeTransaction(txb);
    
    // Extract created registry ID
    if (result?.effects?.created) {
      for (const created of result.effects.created) {
        if (created.owner && typeof created.owner === 'object' && 'Shared' in created.owner) {
          const objectId = created.reference?.objectId;
          if (objectId) {
            console.log(`✅ Created TournamentRegistry: ${objectId}`);
            updateEnvFile(objectId);
            return objectId;
          }
        }
      }
    }
    
    console.error('Failed to extract registry ID from transaction');
    return null;
  } catch (error) {
    console.error('Error creating registry:', error);
    throw error;
  }
}