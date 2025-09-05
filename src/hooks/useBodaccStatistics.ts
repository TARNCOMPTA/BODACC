import { useState, useCallback } from 'react';
import { StatisticsFilters, StatisticsData, StatisticsPeriod } from '../types/bodacc';
import { BodaccApiService } from '../services/bodaccApi';

export function useBodaccStatistics() {
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = useCallback(async (filters: StatisticsFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await BodaccApiService.getStatistics(filters);
      setStatisticsData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      setStatisticsData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    statisticsData,
    isLoading,
    error,
    loadStatistics,
    clearError
  };
}