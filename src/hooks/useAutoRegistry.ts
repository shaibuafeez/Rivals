import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useSuiClient } from '@mysten/dapp-kit';
import { useWallet } from './useWallet';
import { autoSetupTournamentRegistry, createTournamentRegistry } from '@/utils/registryAutoSetup';
import { toast } from 'sonner';

interface AutoRegistryState {
  isChecking: boolean;
  isCreating: boolean;
  registryId: string | null;
  needsCreation: boolean;
  error: string | null;
}

/**
 * Hook that automatically checks for and creates TournamentRegistry if needed
 */
export function useAutoRegistry() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { executeTransaction } = useWallet();
  
  const [state, setState] = useState<AutoRegistryState>({
    isChecking: false,
    isCreating: false,
    registryId: null,
    needsCreation: false,
    error: null
  });
  
  // Check for registry on mount and when account changes
  useEffect(() => {
    if (account?.address) {
      checkRegistry();
    }
  }, [account?.address]);
  
  const checkRegistry = async () => {
    if (!account?.address) return;
    
    setState(prev => ({ ...prev, isChecking: true, error: null }));
    
    try {
      // Temporarily disabled due to SuiClient type conflicts
      const result = { registryId: null, needsCreation: false, error: null, found: false };
      
      setState(prev => ({
        ...prev,
        isChecking: false,
        registryId: result.registryId || null,
        needsCreation: result.needsCreation,
        error: result.error || null
      }));
      
      // Auto registry setup temporarily disabled
      console.log('Auto registry setup result:', result);
    } catch (error) {
      console.error('Error checking registry:', error);
      setState(prev => ({
        ...prev,
        isChecking: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };
  
  const createRegistry = async () => {
    setState(prev => ({ ...prev, isCreating: true, error: null }));
    
    try {
      const registryId = await createTournamentRegistry(executeTransaction);
      
      if (registryId) {
        setState(prev => ({
          ...prev,
          isCreating: false,
          registryId,
          needsCreation: false
        }));
        
        // Note: Cannot update process.env in production build
        
        // Store in localStorage
        localStorage.setItem('TOURNAMENT_REGISTRY_ID', registryId);
        
        toast.success(`Created TournamentRegistry: ${registryId.slice(0, 16)}...`);
        
        // Show instructions to update .env.local
        toast.info(
          'Please update your .env.local file with the new registry ID',
          { duration: 10000 }
        );
      } else {
        throw new Error('Failed to create registry');
      }
    } catch (error) {
      console.error('Error creating registry:', error);
      setState(prev => ({
        ...prev,
        isCreating: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      toast.error('Failed to create registry');
    }
  };
  
  // Get registry ID from environment or localStorage
  const getRegistryId = (): string | null => {
    return state.registryId || 
           process.env.NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID || 
           localStorage.getItem('TOURNAMENT_REGISTRY_ID') ||
           null;
  };
  
  return {
    ...state,
    checkRegistry,
    createRegistry,
    getRegistryId,
    registryId: getRegistryId()
  };
}