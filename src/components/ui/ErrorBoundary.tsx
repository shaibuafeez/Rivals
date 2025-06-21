import React, { Component, ErrorInfo, ReactNode } from 'react';
import { mapErrorToUserMessage, isRegistryError, isNetworkError } from '@/lib/errorMapping';
import { useNetworkInfo } from '@/hooks/useNetworkInfo';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Network-aware error display component
 */
function ErrorDisplay({ error }: { error: Error }) {
  const { networkName } = useNetworkInfo();
  const errorMessage = mapErrorToUserMessage(error);
  
  const isRegistry = isRegistryError(error);
  const isNetwork = isNetworkError(error);
  
  return (
    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
      <div className="flex items-center mb-3">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2 text-red-600" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
          />
        </svg>
        <h3 className="font-medium">Error</h3>
      </div>
      
      <p className="mb-3">{errorMessage}</p>
      
      {isNetwork && (
        <div className="mt-2 p-2 bg-red-100 rounded text-sm">
          <p className="font-medium">Network Issue Detected</p>
          <p>You are currently connected to: <span className="font-bold">{networkName}</span></p>
          <p className="mt-1">Please make sure your wallet is connected to the correct network.</p>
        </div>
      )}
      
      {isRegistry && (
        <div className="mt-2 p-2 bg-red-100 rounded text-sm">
          <p className="font-medium">Registry Issue Detected</p>
          <p>The tournament registry could not be found.</p>
          <p className="mt-1">Try visiting the Admin page to create a new registry.</p>
        </div>
      )}
      
      <div className="mt-3 text-sm text-red-700">
        <details>
          <summary className="cursor-pointer">Technical details</summary>
          <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto text-xs">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      </div>
    </div>
  );
}

/**
 * Error boundary component to catch and display errors
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return <ErrorDisplay error={this.state.error!} />;
    }

    return this.props.children;
  }
}

export { ErrorBoundary, ErrorDisplay };
