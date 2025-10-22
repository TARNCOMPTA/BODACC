import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
}

export function useCache<T>(options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // 5 minutes default TTL
  const cache = useRef(new Map<string, CacheEntry<T>>());
  const [isLoading, setIsLoading] = useState(false);

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      cache.current.delete(key);
      return null;
    }
    
    return entry.data;
  }, []);

  const set = useCallback((key: string, data: T) => {
    // Remove oldest entries if cache is full
    if (cache.current.size >= maxSize) {
      const oldestKey = cache.current.keys().next().value;
      cache.current.delete(oldestKey);
    }
    
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }, [ttl, maxSize]);

  const fetchWithCache = useCallback(async <R>(
    key: string,
    fetchFn: () => Promise<R>
  ): Promise<R> => {
    // Check cache first
    const cached = get(key) as R;
    if (cached) {
      return cached;
    }

    setIsLoading(true);
    try {
      const result = await fetchFn();
      set(key, result as T);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [get, set]);

  const clear = useCallback(() => {
    cache.current.clear();
  }, []);

  const remove = useCallback((key: string) => {
    cache.current.delete(key);
  }, []);

  return {
    get,
    set,
    fetchWithCache,
    clear,
    remove,
    isLoading,
    size: cache.current.size
  };
}