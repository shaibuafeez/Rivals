/**
 * Singleton module to track connection state across the application
 * This ensures we only log connection events once per session
 */

export type NetworkType = 'unknown' | 'testnet' | 'mainnet' | 'devnet';

class ConnectionStateManager {
  private static instance: ConnectionStateManager;
  
  // Wallet connection tracking
  private _hasLoggedWalletConnection = false;
  private _hasCheckedWalletNetwork = false;
  
  // Network info tracking
  private _hasCheckedNetwork = false;
  private _hasLoggedNetworkInfo = false;
  private _lastKnownNetwork: NetworkType = 'unknown';
  
  // Tournament service tracking
  private _isTournamentServiceInitializing = false;
  private _hasTournamentServiceInitialized = false;
  private _hasLoggedTournamentServiceInit = false;
  
  private constructor() {}
  
  public static getInstance(): ConnectionStateManager {
    if (!ConnectionStateManager.instance) {
      ConnectionStateManager.instance = new ConnectionStateManager();
    }
    return ConnectionStateManager.instance;
  }
  
  // Wallet connection getters/setters
  get hasLoggedWalletConnection(): boolean {
    return this._hasLoggedWalletConnection;
  }
  
  set hasLoggedWalletConnection(value: boolean) {
    this._hasLoggedWalletConnection = value;
  }
  
  get hasCheckedWalletNetwork(): boolean {
    return this._hasCheckedWalletNetwork;
  }
  
  set hasCheckedWalletNetwork(value: boolean) {
    this._hasCheckedWalletNetwork = value;
  }
  
  // Network info getters/setters
  get hasCheckedNetwork(): boolean {
    return this._hasCheckedNetwork;
  }
  
  set hasCheckedNetwork(value: boolean) {
    this._hasCheckedNetwork = value;
  }
  
  get hasLoggedNetworkInfo(): boolean {
    return this._hasLoggedNetworkInfo;
  }
  
  set hasLoggedNetworkInfo(value: boolean) {
    this._hasLoggedNetworkInfo = value;
  }
  
  get lastKnownNetwork(): NetworkType {
    return this._lastKnownNetwork;
  }
  
  set lastKnownNetwork(value: NetworkType) {
    this._lastKnownNetwork = value;
  }
  
  // Tournament service getters/setters
  get isTournamentServiceInitializing(): boolean {
    return this._isTournamentServiceInitializing;
  }
  
  set isTournamentServiceInitializing(value: boolean) {
    this._isTournamentServiceInitializing = value;
  }
  
  get hasTournamentServiceInitialized(): boolean {
    return this._hasTournamentServiceInitialized;
  }
  
  set hasTournamentServiceInitialized(value: boolean) {
    this._hasTournamentServiceInitialized = value;
  }
  
  get hasLoggedTournamentServiceInit(): boolean {
    return this._hasLoggedTournamentServiceInit;
  }
  
  set hasLoggedTournamentServiceInit(value: boolean) {
    this._hasLoggedTournamentServiceInit = value;
  }
  
  // Reset all state (useful for disconnections)
  resetConnectionState(): void {
    this._hasLoggedWalletConnection = false;
    this._hasCheckedWalletNetwork = false;
  }
  
  resetNetworkState(): void {
    this._hasCheckedNetwork = false;
    this._hasLoggedNetworkInfo = false;
    this._lastKnownNetwork = 'unknown';
  }
}

// Export a singleton instance
export const connectionState = ConnectionStateManager.getInstance();
