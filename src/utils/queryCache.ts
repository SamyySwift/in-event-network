// Shared caching utility for fast loading on slow networks

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export interface CachedData<T> {
  data: T;
  timestamp: number;
}

export const getCache = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp }: CachedData<T> = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
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
      timestamp: Date.now()
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

// Default query options for slow network optimization
export const slowNetworkQueryOptions = {
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes cache
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 1,
  retryDelay: 1000,
};
