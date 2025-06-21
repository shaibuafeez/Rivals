/* eslint-disable @typescript-eslint/no-explicit-any */
// This file provides a type compatibility layer between the SuiClient from dapp-kit
// and the SuiClient expected by our services

/**
 * Safely cast any SuiClient-like object to the type expected by our services
 * This works around TypeScript errors when passing the SuiClient from dapp-kit
 * to our service classes
 */
export function castToSuiClient(client: any): any {
  // Create a wrapper around the client that adapts the getObject method
  return {
    ...client,
    // Adapt the getObject method to match our expected interface
    getObject: (params: any) => {
      console.log('Calling getObject with params:', params);
      // If params is an object with id, use it directly
      if (params && typeof params === 'object' && params.id) {
        return client.getObject(params);
      }
      // If params is a string, convert it to the expected format
      if (typeof params === 'string') {
        console.log('Converting string param to object format:', params);
        return client.getObject({
          id: params,
          options: { showContent: true }
        });
      }
      // Default case
      return client.getObject(params);
    }
  };
}

// For type annotations only
export type SuiClient = any;
