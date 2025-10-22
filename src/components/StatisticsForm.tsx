import React from 'react';
import { BarChart3, Calendar, Filter } from 'lucide-react';
import { StatisticsFilters } from '../types/bodacc';
import { useBodaccCategories } from '../hooks/useBodaccCategories';
import { DEPARTEMENTS_LIST } from '../constants/departements';

interface StatisticsFormProps {
  filters: StatisticsFilters;
  onFiltersChange: (filters: StatisticsFilters) => void;
  onApplyFilters: () => void;
  isLoading: boolean;
}

export function StatisticsForm({ filters, onFiltersChange, onApplyFilters, isLoading }: StatisticsFormProps) {
  const { categories: dynamicCategories, subCategories, isLoading: categoriesLoading, isLoadingSubCategories } = useBodaccCategories();
  
  const safeCategories = dynamicCategories ?? [];
  const safeSubCategories = subCategories ?? [];

  const categories = [
    { value: '', label: 'Toutes les catégories' },
    ...safeCategories.map(cat => ({ value: cat, label: cat }))
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres statistiques</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="stats-departement" className="block text-sm font-medium text-gray-700 mb-2">
              Département
            </label>
            <select
              id="stats-departement"
              value={filters.departement || ''}
              onChange={(e) => onFiltersChange({ ...filters, departement: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {DEPARTEMENTS_LIST.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="stats-category" className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
              {categoriesLoading && (
                <span className="ml-2 text-xs text-gray-500">(chargement...)</span>
              )}
            </label>
            <select
              id="stats-category"
              value={filters.category || ''}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
              disabled={categoriesLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="stats-subCategory" className="block text-sm font-medium text-gray-700 mb-2">
              Sous-catégorie
              {isLoadingSubCategories && (
                <span className="ml-2 text-xs text-gray-500">(chargement...)</span>
              )}
            </label>
            <select
              id="stats-subCategory"
              value={filters.subCategory || ''}
              onChange={(e) => onFiltersChange({ ...filters, subCategory: e.target.value })}
              disabled={isLoadingSubCategories}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
            <label htmlFor="stats-dateFrom" className="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="stats-dateFrom"
                value={filters.dateFrom || ''}
                onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="stats-dateTo" className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="stats-dateTo"
                value={filters.dateTo || ''}
                onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="stats-periodicity" className="block text-sm font-medium text-gray-700 mb-2">
              Périodicité
            </label>
            <select
              id="stats-periodicity"
              value={filters.periodicity || 'month'}
              onChange={(e) => onFiltersChange({ ...filters, periodicity: e.target.value as 'month' | 'quarter' | 'year' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="month">Mensuelle</option>
              <option value="quarter">Trimestrielle</option>
              <option value="year">Annuelle</option>
            </select>
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
                <BarChart3 className="w-4 h-4 mr-2" />
                Générer les statistiques
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}