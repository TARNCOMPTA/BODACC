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
      const response: ApiResponse = await BodaccApiService.getAnnouncements(filters);
      
      // Tri par date de parution décroissante (plus récente en premier)
      const sortedAnnouncements = response.results.sort((a, b) => {
        const dateA = new Date(a.date_parution || '1900-01-01');
        const dateB = new Date(b.date_parution || '1900-01-01');
        return dateB.getTime() - dateA.getTime();
      });
      
      setAnnouncements(sortedAnnouncements);
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