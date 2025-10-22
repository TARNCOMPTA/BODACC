import { useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { useCache } from './useCache';
import { BodaccAnnouncement, SearchFilters, ApiResponse } from '../types/bodacc';
import { BodaccApiService } from '../services/bodaccApi';

export function useBodaccData() {
  const [announcements, setAnnouncements] = useState<BodaccAnnouncement[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const cache = useCache<ApiResponse>({ ttl: 5 * 60 * 1000 });

  const loadAnnouncements = useCallback(async (filters: SearchFilters) => {
    const cacheKey = JSON.stringify(filters);

    setIsLoading(true);
    setError(null);
    setProgress(10);

    try {
      setProgress(30);

      const response = await cache.fetchWithCache(cacheKey, async () => {
        setProgress(60);
        return await BodaccApiService.getAnnouncements(filters);
      });

      setProgress(90);
      setAnnouncements(response.results);
      setTotalCount(response.total_count);
      setProgress(100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      setAnnouncements([]);
      setTotalCount(0);
      setProgress(0);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [cache]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCache = useCallback(() => {
    cache.clear();
  }, [cache]);

  return {
    announcements,
    totalCount,
    isLoading,
    error,
    progress,
    loadAnnouncements,
    clearError,
    clearCache,
    cacheSize: cache.size
  };
}
