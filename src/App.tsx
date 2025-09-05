import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchForm } from './components/SearchForm';
import { SearchResults } from './components/SearchResults';
import { ErrorMessage } from './components/ErrorMessage';
import { useBodaccData } from './hooks/useBodaccSearch';
import { SearchFilters } from './types/bodacc';

function App() {
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
    loadAnnouncements,
    clearError 
  } = useBodaccData();

  const handleApplyFilters = useCallback(() => {
    loadAnnouncements(filters);
  }, [filters, loadAnnouncements]);

  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // Si c'est un changement de page, charger automatiquement
    if (newFilters.page !== filters.page && announcements.length > 0) {
      loadAnnouncements(newFilters);
    }
  }, []);

  const handleRetry = useCallback(() => {
    clearError();
    handleApplyFilters();
  }, [clearError, handleApplyFilters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Annonces BODACC
            </h2>
            <p className="text-gray-600">
              Consultez et filtrez les annonces officielles du Bulletin officiel des annonces civiles et commerciales
            </p>
          </div>
          
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
          
          {(announcements.length > 0 || isLoading) && (
            <SearchResults
              announcements={announcements}
              totalCount={totalCount}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>
              Données issues de l'API BODACC officielle • 
              <a 
                href="https://www.data.gouv.fr/fr/datasets/bodacc-c/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                Source: data.gouv.fr
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;