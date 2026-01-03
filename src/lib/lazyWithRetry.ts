import { lazy, ComponentType } from 'react';

const RETRY_COUNT = 3;
const RETRY_DELAYS = [500, 1000, 2000]; // Exponential backoff

// Track if we've already attempted a reload for stale chunks
const RELOAD_KEY = 'lazy_chunk_reload_attempted';

function isChunkLoadError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('dynamically imported module') ||
    message.includes('failed to fetch') ||
    message.includes('loading chunk') ||
    message.includes('loading css chunk') ||
    message.includes('unable to preload')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= RETRY_COUNT; attempt++) {
      try {
        // Add cache-busting query param on retry attempts
        if (attempt > 0) {
          await sleep(RETRY_DELAYS[attempt - 1] || 2000);
        }
        
        const module = await importFn();
        
        // Success - clear any reload flags
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(RELOAD_KEY);
        }
        
        return module;
      } catch (error) {
        lastError = error as Error;
        console.warn(`[LazyLoad] Attempt ${attempt + 1}/${RETRY_COUNT + 1} failed:`, lastError.message);
        
        // If it's not a chunk error, don't retry
        if (!isChunkLoadError(lastError)) {
          throw lastError;
        }
      }
    }

    // All retries failed - check if we should auto-reload
    if (lastError && isChunkLoadError(lastError)) {
      const hasReloaded = typeof sessionStorage !== 'undefined' && 
        sessionStorage.getItem(RELOAD_KEY) === 'true';
      
      if (!hasReloaded) {
        // Mark that we're about to reload to prevent infinite loops
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(RELOAD_KEY, 'true');
        }
        
        console.log('[LazyLoad] Chunk load failed after retries. Reloading page...');
        window.location.reload();
        
        // Return a never-resolving promise while reloading
        return new Promise(() => {});
      }
    }

    // If we've already reloaded once, throw the error for the error boundary
    throw lastError || new Error('Failed to load module');
  });
}
