// Shared caching utility for fast loading on slow networks

const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes (increased from 5)
const SLOW_NETWORK_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes for very slow networks

export interface CachedData<T> {
  data: T;
  timestamp: number;
  version: number;
}

const CACHE_VERSION = 1;

export const getCache = <T>(key: string, useSlowNetworkExpiry = false): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp, version }: CachedData<T> = JSON.parse(cached);
    
    // Invalidate if version mismatch
    if (version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }
    
    const expiry = useSlowNetworkExpiry ? SLOW_NETWORK_CACHE_EXPIRY : CACHE_EXPIRY;
    if (Date.now() - timestamp > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

export const setCache = <T>(key: string, data: T): void => {
  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch {
    // Ignore localStorage errors (quota exceeded, etc.)
  }
};

export const clearCache = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
};

export const clearAllCache = (prefix?: string): void => {
  try {
    if (prefix) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      localStorage.clear();
    }
  } catch {
    // Ignore errors
  }
};

// Default query options for slow network optimization
export const slowNetworkQueryOptions = {
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 15 * 60 * 1000, // 15 minutes cache (increased from 10)
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 1,
  retryDelay: 1000,
};

// Even more aggressive caching for very slow connections
export const ultraSlowNetworkQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes cache
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 0, // No retries on ultra slow
  retryDelay: 2000,
};
