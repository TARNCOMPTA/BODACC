import { useState, useCallback } from 'react';
import { BodaccAnnouncement, SearchFilters, ApiResponse } from '../types/bodacc';
import { BodaccApiService } from '../services/bodaccApi';

export function useBodaccData() {
  const [announcements, setAnnouncements] = useState<BodaccAnnouncement[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadAnnouncements = useCallback(async (filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BodaccApiService.getAnnouncements(filters);
      setAnnouncements(response.results);
      setTotalCount(response.total_count);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      setAnnouncements([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    announcements,
    totalCount,
    isLoading,
    error,
    loadAnnouncements,
    clearError
  };
}