import { useState, useCallback } from 'react';
import { Tournament } from '@/services/tournamentService';
import { executeWithRetry, isRetryableError } from '@/lib/retry';

// Type for the cache entry
interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

// Default cache duration in milliseconds (2 minutes)
const DEFAULT_CACHE_DURATION = 2 * 60 * 1000;

/**
 * Custom hook for caching tournament data with retry logic
 */
export function useTournamentCache<T = Tournament[]>() {
  // Cache state
  const [cache, setCache] = useState<CacheEntry<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches data with caching and retry logic
   * @param fetchFn Function to fetch the data
   * @param forceRefresh Whether to force a refresh ignoring cache
   * @param cacheDuration How long to cache data in milliseconds
   * @returns The fetched or cached data
   */
  const fetchWithCache = useCallback(async (
    fetchFn: () => Promise<T>,
    forceRefresh = false,
    cacheDuration = DEFAULT_CACHE_DURATION
  ): Promise<T> => {
    setError(null);
    
    // Check if we can use cached data
    const currentTime = Date.now();
    if (
      !forceRefresh && 
      cache && 
      (currentTime - cache.timestamp < cacheDuration)
    ) {
      console.log('Using cached tournament data');
      return cache.data;
    }
    
    // Need to fetch fresh data
    setLoading(true);
    
    try {
      // Use retry logic for the fetch operation
      const data = await executeWithRetry(
        fetchFn,
        3, // max retries
        1000, // base delay
        isRetryableError // only retry for specific errors
      );
      
      // Update cache with new data
      const newCacheEntry = {
        timestamp: Date.now(),
        data
      };
      setCache(newCacheEntry);
      setLoading(false);
      
      return data;
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setLoading(false);
      
      // Return cached data if available, otherwise throw
      if (cache) {
        console.log('Returning stale cached data after error');
        return cache.data;
      }
      throw errorObj;
    }
  }, [cache]);

  /**
   * Clears the cache
   */
  const clearCache = useCallback(() => {
    setCache(null);
  }, []);

  /**
   * Updates the cache with new data without fetching
   */
  const updateCache = useCallback((data: T) => {
    setCache({
      timestamp: Date.now(),
      data
    });
  }, []);

  return {
    fetchWithCache,
    clearCache,
    updateCache,
    loading,
    error,
    cachedData: cache?.data || null,
    cacheTimestamp: cache?.timestamp || null,
    isCacheStale: cache ? (Date.now() - cache.timestamp > DEFAULT_CACHE_DURATION) : true
  };
}
