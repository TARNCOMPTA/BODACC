import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { SearchFilters } from '../types/bodacc';
import { useDebounce } from '../hooks/useDebounce';
import { useBodaccCategories } from '../hooks/useBodaccCategories';
import { DEPARTEMENTS_LIST } from '../constants/departements';

interface SearchFormProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onApplyFilters: () => void;
  isLoading: boolean;
}

export function SearchForm({ filters, onFiltersChange, onApplyFilters, isLoading }: SearchFormProps) {
  const { categories: dynamicCategories, subCategories, isLoading: categoriesLoading, isLoadingSubCategories } = useBodaccCategories();
  
  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(filters.query, 500);
  
  // Protection contre les valeurs undefined pour éviter les warnings React
  const safeCategories = dynamicCategories ?? [];
  const safeSubCategories = subCategories ?? [];

  // Construire la liste des catégories avec l'option "Toutes"
  const categories = [
    { value: '', label: 'Toutes les catégories' },
    ...safeCategories.map(cat => ({ value: cat, label: cat }))
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters();
  };

  // Auto-search when debounced query changes (if there's a query)
  React.useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 3) {
      onApplyFilters();
    }
  }, [debouncedQuery, onApplyFilters]);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtres BODACC</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recherche textuelle
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="query"
                value={filters.query || ''}
                onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
                placeholder="Nom d'entreprise, SIREN, activité... (min. 3 caractères)"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {filters.query && filters.query.length > 0 && filters.query.length < 3 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Tapez au moins 3 caractères pour déclencher la recherche automatique
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="departement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Département
            </label>
            <select
              id="departement"
              value={filters.departement || ''}
              onChange={(e) => onFiltersChange({ ...filters, departement: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {DEPARTEMENTS_LIST.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégorie
              {categoriesLoading && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(chargement...)</span>
              )}
            </label>
            <select
              id="category"
              value={filters.category || ''}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
              disabled={categoriesLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sous-catégorie
              {isLoadingSubCategories && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(chargement...)</span>
              )}
            </label>
            <select
              id="subCategory"
              value={filters.subCategory || ''}
              onChange={(e) => onFiltersChange({ ...filters, subCategory: e.target.value })}
              disabled={isLoadingSubCategories}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              <option value="">Toutes les sous-catégories</option>
              {safeSubCategories.map((subCat) => (
                <option key={subCat} value={subCat}>
                  {subCat}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date de début
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="dateFrom"
                value={filters.dateFrom || ''}
                onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date de fin
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="dateTo"
                value={filters.dateTo || ''}
                onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Chargement...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}