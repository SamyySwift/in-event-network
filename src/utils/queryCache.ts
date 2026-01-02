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
  staleTime: 3 * 60 * 1000, // 3 minutes - keeps data fresh longer
  gcTime: 20 * 60 * 1000, // 20 minutes cache
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 1,
  retryDelay: 800,
  networkMode: 'offlineFirst' as const, // Show cached data immediately
};

// Even more aggressive caching for very slow connections
export const ultraSlowNetworkQueryOptions = {
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 60 * 60 * 1000, // 60 minutes cache
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 0,
  retryDelay: 2000,
  networkMode: 'offlineFirst' as const,
};
