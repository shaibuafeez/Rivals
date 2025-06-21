'use client';

import { useAutoRegistry } from '@/hooks/useAutoRegistry';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle, Plus } from 'lucide-react';

interface AutoRegistrySetupProps {
  onRegistryReady?: (registryId: string) => void;
  children?: React.ReactNode;
}

export function AutoRegistrySetup({ onRegistryReady, children }: AutoRegistrySetupProps) {
  const { 
    isChecking, 
    isCreating, 
    registryId, 
    needsCreation, 
    error,
    createRegistry 
  } = useAutoRegistry();
  
  useEffect(() => {
    if (registryId && onRegistryReady) {
      onRegistryReady(registryId);
    }
  }, [registryId, onRegistryReady]);
  
  // If checking, show loading state
  if (isChecking) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
        <span className="text-gray-600 dark:text-gray-400">
          Checking for TournamentRegistry...
        </span>
      </div>
    );
  }
  
  // If error occurred
  if (error && !needsCreation) {
    return (
      <Alert className="max-w-2xl mx-auto my-4 border-red-500">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertTitle>Registry Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  // If registry needs to be created
  if (needsCreation) {
    return (
      <div className="max-w-2xl mx-auto my-8">
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-lg">Tournament Registry Required</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>
              No TournamentRegistry found on the blockchain. A registry is required to create and manage tournaments.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This is a one-time setup that creates a shared registry for all tournaments.
            </p>
            <Button 
              onClick={createRegistry}
              disabled={isCreating}
              className="w-full sm:w-auto"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Registry...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tournament Registry
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // If registry is ready
  if (registryId) {
    // Show success briefly, then render children
    return (
      <>
        <div className="max-w-2xl mx-auto my-4">
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Registry Ready</AlertTitle>
            <AlertDescription>
              <p className="text-sm">
                Tournament Registry: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  {registryId.slice(0, 16)}...
                </code>
              </p>
            </AlertDescription>
          </Alert>
        </div>
        {children}
      </>
    );
  }
  
  // Default: render children
  return <>{children}</>;
}

/**
 * HOC to wrap any component with automatic registry setup
 */
export function withAutoRegistry<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <AutoRegistrySetup>
        <Component {...props} />
      </AutoRegistrySetup>
    );
  };
}