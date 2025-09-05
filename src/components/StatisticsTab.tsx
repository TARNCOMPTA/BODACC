import React, { useState, useCallback } from 'react';
import { StatisticsForm } from './StatisticsForm';
import { StatisticsResults } from './StatisticsResults';
import { ErrorMessage } from './ErrorMessage';
import { useBodaccStatistics } from '../hooks/useBodaccStatistics';
import { StatisticsFilters } from '../types/bodacc';

export function StatisticsTab() {
  const today = new Date();
  const startYear = today.getFullYear() - 3;
  const threeYearsAgoString = `${startYear}-01-01`; // Format direct pour éviter les problèmes de fuseau horaire
  const todayString = today.toISOString().split('T')[0];
  
  const [filters, setFilters] = useState<StatisticsFilters>({
    departement: '',
    category: '',
    subCategory: '',
    dateFrom: threeYearsAgoString,
    dateTo: todayString,
    periodicity: 'month'
  });

  const { 
    statisticsData, 
    isLoading, 
    error, 
    loadStatistics,
    clearError 
  } = useBodaccStatistics();

  const handleApplyFilters = useCallback(() => {
    loadStatistics(filters);
  }, [filters, loadStatistics]);

  const handleFiltersChange = useCallback((newFilters: StatisticsFilters) => {
    setFilters(newFilters);
  }, []);

  const handleRetry = useCallback(() => {
    clearError();
    handleApplyFilters();
  }, [clearError, handleApplyFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Statistiques BODACC
          </h2>
          <p className="text-gray-600">
            Analysez les tendances et comparez les données des annonces officielles par période
          </p>
        </div>
        
        <StatisticsForm
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          isLoading={isLoading}
        />
        
        {error && (
          <ErrorMessage
            message={error}
            onRetry={handleRetry}
          />
        )}
        
        {(statisticsData || isLoading) && (
          <StatisticsResults
            data={statisticsData!}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}