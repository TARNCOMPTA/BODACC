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
        
        {/* Tableau détaillé - toujours affiché */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tableau détaillé</h3>
          <div className="overflow-x-auto">
                {(() => {
                  // Organiser les données par année
                  const yearlyData: Record<string, Record<string, number>> = {};
                  const years = new Set<string>();
                  const periodTypes = new Set<string>();
                  
                  data.periods.forEach(period => {
                    let year: string;
                    let periodType: string;
                    
                    if (period.period.includes('T')) {
                      // Format trimestre: "T1 2024"
                      const parts = period.period.split(' ');
                      year = parts[1];
                      periodType = parts[0];
                    } else if (period.period.includes(' ')) {
                      // Format mois: "Jan 2024"
                      const parts = period.period.split(' ');
                      year = parts[1];
                      periodType = parts[0];
                    } else {
                      // Format année: "2024"
                      year = period.period;
                      periodType = 'Année';
                    }
                    
                    years.add(year);
                    periodTypes.add(periodType);
                    
                    if (!yearlyData[periodType]) {
                      yearlyData[periodType] = {};
                    }
                    yearlyData[periodType][year] = period.count;
                  });
                  
                  const sortedYears = Array.from(years).sort();
                  
                  // Ordre chronologique pour les mois
                  const monthOrder = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
                  const quarterOrder = ['T1', 'T2', 'T3', 'T4'];
                  
                  const sortedPeriodTypes = Array.from(periodTypes).sort((a, b) => {
                    // Si ce sont des mois, utiliser l'ordre chronologique
                    if (monthOrder.includes(a) && monthOrder.includes(b)) {
                      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
                    }
                    // Si ce sont des trimestres, utiliser l'ordre chronologique
                    if (quarterOrder.includes(a) && quarterOrder.includes(b)) {
                      return quarterOrder.indexOf(a) - quarterOrder.indexOf(b);
                    }
                    // Sinon, tri alphabétique
                    return a.localeCompare(b);
                  });
                  
                  // Fonction pour obtenir le libellé complet
                  const getFullLabel = (periodType: string) => {
                    const monthLabels: Record<string, string> = {
                      'Jan': 'Janvier',
                      'Fév': 'Février', 
                      'Mar': 'Mars',
                      'Avr': 'Avril',
                      'Mai': 'Mai',
                      'Jun': 'Juin',
                      'Jul': 'Juillet',
                      'Aoû': 'Août',
                      'Sep': 'Septembre',
                      'Oct': 'Octobre',
                      'Nov': 'Novembre',
                      'Déc': 'Décembre'
                    };
                    
                    const quarterLabels: Record<string, string> = {
                      'T1': '1er Trimestre',
                      'T2': '2ème Trimestre', 
                      'T3': '3ème Trimestre',
                      'T4': '4ème Trimestre'
                    };
                    
                    return monthLabels[periodType] || quarterLabels[periodType] || periodType;
                  };
                  
                  // Calculer les totaux par année
                  const yearTotals: Record<string, number> = {};
                  const periodAverages: Record<string, number> = {};
                  sortedYears.forEach(year => {
                    yearTotals[year] = sortedPeriodTypes.reduce((sum, periodType) => {
                      return sum + (yearlyData[periodType]?.[year] || 0);
                    }, 0);
                  });
                  
                  // Calculer les moyennes par période
                  sortedPeriodTypes.forEach(periodType => {
                    const values = sortedYears.map(year => yearlyData[periodType]?.[year] || 0);
                    const sum = values.reduce((acc, val) => acc + val, 0);
                    periodAverages[periodType] = values.length > 0 ? sum / values.length : 0;
                  });
                  
                  // Calculer la moyenne générale
                  const totalSum = Object.values(yearTotals).reduce((sum, total) => sum + total, 0);
                  const generalAverage = sortedYears.length > 0 ? totalSum / sortedYears.length : 0;
                  
                  return (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Période
                          </th>
                          {sortedYears.map(year => (
                            <th key={year} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div>{year}</div>
                              {sortedYears.indexOf(year) > 0 && (
                                <div className="text-xs text-gray-400 mt-1">
                                  vs {sortedYears[sortedYears.indexOf(year) - 1]}
                                </div>
                              )}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Moyenne
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedPeriodTypes.map(periodType => (
                          <tr key={periodType} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {getFullLabel(periodType)}
                            </td>
                            {sortedYears.map(year => {
                              const currentValue = yearlyData[periodType]?.[year] || 0;
                              const previousYearIndex = sortedYears.indexOf(year) - 1;
                              const previousValue = previousYearIndex >= 0 
                                ? yearlyData[periodType]?.[sortedYears[previousYearIndex]] || 0 
                                : 0;
                              const evolution = previousValue > 0 ? ((currentValue - previousValue) / previousValue * 100) : 0;
                              
                              return (
                                <td key={year} className="px-4 py-4 whitespace-nowrap text-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {currentValue.toLocaleString('fr-FR')}
                                  </div>
                                  {previousYearIndex >= 0 && currentValue > 0 && (
                                    <div className={`text-xs flex items-center justify-center space-x-1 mt-1 ${
                                      evolution > 0 ? 'text-green-600' : evolution < 0 ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                      {evolution > 0 ? (
                                        <TrendingUp className="w-3 h-3" />
                                      ) : evolution < 0 ? (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                        </svg>
                                      ) : (
                                        <div className="w-3 h-3" />
                                      )}
                                      <span>{Math.abs(evolution).toFixed(1)}%</span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-bold text-gray-900">
                                {Math.round(generalAverage).toLocaleString('fr-FR')}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-medium text-gray-900">
                                {Math.round(periodAverages[periodType]).toLocaleString('fr-FR')}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {/* Ligne de total */}
                        <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            TOTAL
                          </td>
                          {sortedYears.map(year => {
                            const currentTotal = yearTotals[year];
                            const previousYearIndex = sortedYears.indexOf(year) - 1;
                            const previousTotal = previousYearIndex >= 0 ? yearTotals[sortedYears[previousYearIndex]] : 0;
                            const totalEvolution = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100) : 0;
                            
                            return (
                              <td key={year} className="px-4 py-4 whitespace-nowrap text-center">
                                <div className="text-sm font-bold text-gray-900">
                                  {currentTotal.toLocaleString('fr-FR')}
                                </div>
                                {previousYearIndex >= 0 && currentTotal > 0 && (
                                  <div className={`text-xs flex items-center justify-center space-x-1 mt-1 font-semibold ${
                                    totalEvolution > 0 ? 'text-green-600' : totalEvolution < 0 ? 'text-red-600' : 'text-gray-500'
                                  }`}>
                                    {totalEvolution > 0 ? (
                                      <TrendingUp className="w-3 h-3" />
                                    ) : totalEvolution < 0 ? (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                      </svg>
                                    ) : (
                                      <div className="w-3 h-3" />
                                    )}
                                    <span>{Math.abs(totalEvolution).toFixed(1)}%</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-bold text-gray-900">
                              {Math.round(generalAverage).toLocaleString('fr-FR')}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  );
                })()}
              </div>
        </div>
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
              <h4 className="font-medium text-gray-800 mb-2">Période la plus faible</h4>
              <div className="bg-white rounded-lg p-4 border border-red-100">
                {(() => {
                  const minPeriod = data.periods.reduce((min, period) => 
                    period.count < min.count ? period : min
                  );
                  return (
                    <div>
                      <p className="text-lg font-semibold text-red-600">{minPeriod.period}</p>
                      <p className="text-sm text-gray-600">{minPeriod.count.toLocaleString('fr-FR')} annonces</p>
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