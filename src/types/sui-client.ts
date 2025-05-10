/* eslint-disable @typescript-eslint/no-explicit-any */
// This file provides a type compatibility layer between the SuiClient from dapp-kit
// and the SuiClient expected by our services

/**
 * Safely cast any SuiClient-like object to the type expected by our services
 * This works around TypeScript errors when passing the SuiClient from dapp-kit
 * to our service classes
 */
export function castToSuiClient(client: any): any {
  return client;
}

// For type annotations only
export type SuiClient = any;
