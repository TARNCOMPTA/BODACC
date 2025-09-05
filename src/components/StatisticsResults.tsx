import React from 'react';
import { BarChart3, TrendingUp, Building2, MapPin, Download, Calendar } from 'lucide-react';
import { StatisticsData } from '../types/bodacc';

interface StatisticsResultsProps {
  data: StatisticsData;
  isLoading: boolean;
}

export function StatisticsResults({ data, isLoading }: StatisticsResultsProps) {
  const handleExportStats = () => {
    if (!data) return;
    
    const escapeCsv = (value: string | number) => {
      if (value === null || value === undefined) return '""';
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    };
    
    // Export des données par période
    const csvHeaders = ['Période', 'Nombre d\'annonces'];
    const csvData = data.periods.map(period => [
      escapeCsv(period.period),
      escapeCsv(period.count)
    ]);
    
    // Ajouter BOM UTF-8 pour Excel FR
    const BOM = '\uFEFF';
    const csvContent = BOM + [csvHeaders.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bodacc-statistiques-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Génération des statistiques...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total annonces</p>
              <p className="text-2xl font-semibold text-gray-900">{data.totalCount.toLocaleString('fr-FR')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Moyenne par période</p>
              <p className="text-2xl font-semibold text-gray-900">{Math.round(data.averagePerPeriod).toLocaleString('fr-FR')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Périodes analysées</p>
              <p className="text-2xl font-semibold text-gray-900">{data.periods.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Évolution par période */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Évolution par période</h3>
          <button
            onClick={handleExportStats}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-4">
            {data.periods.map((period, index) => {
              const maxCount = Math.max(...data.periods.map(p => p.count));
              const height = maxCount > 0 ? (period.count / maxCount) * 200 : 0;
              
              return (
                <div key={index} className="flex flex-col items-center min-w-0 flex-1">
                  <div className="w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: '220px' }}>
                    <div className="w-full flex flex-col justify-end h-full">
                      <div 
                        className="w-full bg-blue-500 rounded-t transition-all duration-500 ease-out flex items-end justify-center pb-2"
                        style={{ height: `${height}px` }}
                      >
                        <span className="text-white text-xs font-medium">
                          {period.count.toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center font-medium">
                    {period.period}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top catégories, départements et sous-catégories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top catégories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Top catégories
          </h3>
          <div className="space-y-3">
            {data.topCategories.slice(0, 5).map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {category.name}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {category.count.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {category.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top départements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            Top départements
          </h3>
          <div className="space-y-3">
            {data.topDepartments.slice(0, 5).map((department, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {department.name}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${department.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {department.count.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {department.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top sous-catégories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-purple-600" />
            Top sous-catégories
          </h3>
          <div className="space-y-3">
            {data.topSubCategories.slice(0, 5).map((subCategory, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {subCategory.name}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${subCategory.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {subCategory.count.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {subCategory.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}