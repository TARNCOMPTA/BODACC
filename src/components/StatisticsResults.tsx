import React from 'react';
import { TrendingUp, Building2, Download, Calendar } from 'lucide-react';
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
        
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-2 min-w-max" style={{ minWidth: `${Math.max(800, data.periods.length * 80)}px` }}>
            {data.periods.map((period, index) => {
              const maxCount = Math.max(...data.periods.map(p => p.count));
              const height = maxCount > 0 ? (period.count / maxCount) * 300 : 0;
              
              return (
                <div key={index} className="flex flex-col items-center" style={{ minWidth: '70px' }}>
                  <div className="w-full bg-gray-100 rounded-lg overflow-hidden relative group" style={{ height: '320px', width: '60px' }}>
                    <div className="w-full flex flex-col justify-end h-full">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-700 ease-out relative hover:from-blue-700 hover:to-blue-500"
                        style={{ height: `${height}px` }}
                      >
                        {/* Tooltip au survol */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          {period.count.toLocaleString('fr-FR')} annonces
                        </div>
                        
                        {/* Valeur visible en permanence si assez de place */}
                        {height > 40 && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                            <span className="text-white text-xs font-bold text-center block leading-tight">
                              {period.count > 999 ? `${Math.round(period.count/1000)}k` : period.count}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Étiquette de période */}
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-700 font-semibold leading-tight">
                      {period.period}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {period.count.toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Légende et informations supplémentaires */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-t from-blue-600 to-blue-400 rounded"></div>
              <span>Nombre d'annonces par période</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Maximum: {Math.max(...data.periods.map(p => p.count)).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Minimum: {Math.min(...data.periods.map(p => p.count)).toLocaleString('fr-FR')}</span>
            </div>
          </div>
        </div>
        
        {/* Tableau détaillé pour les grandes datasets */}
        {data.periods.length > 12 && (
          <div className="mt-6">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-2">
                <span>Voir le tableau détaillé</span>
                <div className="w-4 h-4 transition-transform group-open:rotate-180">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Période
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre d'annonces
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Évolution
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.periods.map((period, index) => {
                      const previousCount = index > 0 ? data.periods[index - 1].count : period.count;
                      const evolution = index > 0 ? ((period.count - previousCount) / previousCount * 100) : 0;
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {period.period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {period.count.toLocaleString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {index > 0 && (
                              <span className={`inline-flex items-center space-x-1 ${
                                evolution > 0 ? 'text-green-600' : evolution < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {evolution > 0 ? (
                                  <TrendingUp className="w-4 h-4" />
                                ) : evolution < 0 ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                  </svg>
                                ) : (
                                  <div className="w-4 h-4" />
                                )}
                                <span>{Math.abs(evolution).toFixed(1)}%</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Résumé des tendances */}
      {data.periods.length > 2 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Analyse des tendances</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Période la plus active</h4>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                {(() => {
                  const maxPeriod = data.periods.reduce((max, period) => 
                    period.count > max.count ? period : max
                  );
                  return (
                    <div>
                      <p className="text-lg font-semibold text-blue-600">{maxPeriod.period}</p>
                      <p className="text-sm text-gray-600">{maxPeriod.count.toLocaleString('fr-FR')} annonces</p>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Évolution générale</h4>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                {(() => {
                  const firstPeriod = data.periods[0];
                  const lastPeriod = data.periods[data.periods.length - 1];
                  const globalEvolution = ((lastPeriod.count - firstPeriod.count) / firstPeriod.count * 100);
                  
                  return (
                    <div className="flex items-center space-x-2">
                      {globalEvolution > 0 ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : globalEvolution < 0 ? (
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 bg-gray-400 rounded-full" />
                      )}
                      <div>
                        <p className={`text-lg font-semibold ${
                          globalEvolution > 0 ? 'text-green-600' : 
                          globalEvolution < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {globalEvolution > 0 ? '+' : ''}{globalEvolution.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600">
                          {globalEvolution > 0 ? 'Hausse' : globalEvolution < 0 ? 'Baisse' : 'Stable'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}