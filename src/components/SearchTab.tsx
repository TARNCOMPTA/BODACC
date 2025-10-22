import React, { useState, useCallback } from 'react';
import { SearchForm } from './SearchForm';
import { SearchResults } from './SearchResults';
import { ErrorMessage } from './ErrorMessage';
import { ProgressBar } from './ProgressBar';
import { useBodaccData } from '../hooks/useBodaccSearchOptimized';
import { SearchFilters } from '../types/bodacc';

export function SearchTab() {
  const today = new Date();
  const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  const todayString = today.toISOString().split('T')[0];
  const oneMonthAgoString = oneMonthAgo.toISOString().split('T')[0];
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    departement: '',
    category: '',
    subCategory: '',
    dateFrom: oneMonthAgoString,
    dateTo: todayString,
    page: 1,
    limit: 20,
    sort: '-dateparution'
  });

  const { 
    announcements, 
    totalCount, 
    isLoading, 
    error, 
    progress,
    loadAnnouncements,
    clearError,
    clearCache,
    cacheSize
  } = useBodaccData();

  const handleApplyFilters = useCallback(() => {
    loadAnnouncements(filters);
  }, [filters, loadAnnouncements]);

  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // Si c'est un changement de page, tri, ou limite, charger automatiquement
    if ((newFilters.page !== filters.page || 
         newFilters.sort !== filters.sort || 
         newFilters.limit !== filters.limit) && 
        announcements.length > 0) {
      loadAnnouncements(newFilters);
    }
  }, [filters, announcements.length, loadAnnouncements]);

  const handleRetry = useCallback(() => {
    clearError();
    handleApplyFilters();
  }, [clearError, handleApplyFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Annonces BODACC
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Consultez et filtrez les annonces officielles du Bulletin officiel des annonces civiles et commerciales
            </p>
            {cacheSize > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Cache: {cacheSize} requêtes</span>
                <button
                  onClick={clearCache}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Vider
                </button>
              </div>
            )}
          </div>
        </div>
        
        {isLoading && progress > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Chargement en cours...</span>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <ProgressBar progress={progress} />
          </div>
        )}
        
        <SearchForm
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
        
        {(announcements.length > 0 || isLoading || (!isLoading && announcements.length === 0 && (filters.query || filters.departement || filters.category || filters.subCategory))) && (
          <SearchResults
            announcements={announcements}
            totalCount={totalCount}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}