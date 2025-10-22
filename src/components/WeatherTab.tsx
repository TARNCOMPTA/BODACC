import React, { useState, useCallback } from 'react';
import { CloudSun, Search, Sun, Cloud, CloudRain, TrendingUp, TrendingDown, Minus, Building2, UserX, Calculator } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';
import { BodaccApiService } from '../services/bodaccApi';
import { DEPARTEMENTS_LIST } from '../constants/departements';

interface WeatherData {
  departmentCode: string;
  departmentName: string;
  creations: number;
  radiations: number;
  difference: number;
  evolution: number;
  weather: 'sunny' | 'cloudy' | 'rainy';
}

function WeatherTab() {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWeatherIcon = (weather: 'sunny' | 'cloudy' | 'rainy', size = 'w-12 h-12') => {
    switch (weather) {
      case 'sunny':
        return <Sun className={`${size} text-yellow-500`} />;
      case 'cloudy':
        return <Cloud className={`${size} text-gray-500`} />;
      case 'rainy':
        return <CloudRain className={`${size} text-blue-500`} />;
    }
  };

  const getWeatherFromEvolution = (evolution: number): 'sunny' | 'cloudy' | 'rainy' => {
    if (evolution > 10) return 'sunny';
    if (evolution < -10) return 'rainy';
    return 'cloudy';
  };

  const loadWeatherData = useCallback(async () => {
    if (!selectedDepartment) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculer le mois précédent à aujourd'hui
      const today = new Date();
      const currentMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const previousMonth = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      
      // Période actuelle (mois précédent)
      const currentStart = currentMonth.toISOString().split('T')[0].substring(0, 8) + '01';
      const currentEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];
      
      // Période précédente (2 mois avant)
      const previousStart = previousMonth.toISOString().split('T')[0].substring(0, 8) + '01';
      const previousEnd = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).toISOString().split('T')[0];
      
      // Rechercher les créations pour la période actuelle
      const currentCreationsResponse = await BodaccApiService.getAnnouncements({
        query: '',
        departement: selectedDepartment,
        category: '',
        subCategory: 'Créations',
        dateFrom: currentStart,
        dateTo: currentEnd,
        page: 1,
        limit: 1
      });
      
      // Rechercher les radiations pour la période actuelle
      const currentRadiationsResponse = await BodaccApiService.getAnnouncements({
        query: '',
        departement: selectedDepartment,
        category: '',
        subCategory: 'Radiations',
        dateFrom: currentStart,
        dateTo: currentEnd,
        page: 1,
        limit: 1
      });
      
      // Rechercher les créations pour la période précédente
      const previousCreationsResponse = await BodaccApiService.getAnnouncements({
        query: '',
        departement: selectedDepartment,
        category: '',
        subCategory: 'Créations',
        dateFrom: previousStart,
        dateTo: previousEnd,
        page: 1,
        limit: 1
      });
      
      const currentCreations = currentCreationsResponse.total_count;
      const currentRadiations = currentRadiationsResponse.total_count;
      const previousCreations = previousCreationsResponse.total_count;
      
      const difference = currentCreations - currentRadiations;
      const evolution = previousCreations > 0 ? ((currentCreations - previousCreations) / previousCreations) * 100 : 0;
      
      const departmentInfo = DEPARTEMENTS_LIST.find(d => d.code === selectedDepartment);
      
      setWeatherData({
        departmentCode: selectedDepartment,
        departmentName: departmentInfo?.name || selectedDepartment,
        creations: currentCreations,
        radiations: currentRadiations,
        difference,
        evolution,
        weather: getWeatherFromEvolution(evolution)
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDepartment]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDepartment) {
      loadWeatherData();
    }
  };

  const handleRetry = useCallback(() => {
    setError(null);
    loadWeatherData();
  }, [loadWeatherData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
            <CloudSun className="w-8 h-8 text-blue-600" />
            <span>Météo économique</span>
          </h2>
          <p className="text-gray-600">
            Consultez la météo économique d'un département basée sur les créations et radiations d'entreprises
          </p>
        </div>
        
        {/* Formulaire de recherche */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recherche par département</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="weather-departement" className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner un département
                </label>
                <select
                  id="weather-departement"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Choisir un département...</option>
                  {DEPARTEMENTS_LIST.filter(d => d.code !== '').map((dept) => (
                    <option key={dept.code} value={dept.code}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isLoading || !selectedDepartment}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Chargement...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyser
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {error && (
          <ErrorMessage
            message={error}
            onRetry={handleRetry}
          />
        )}
        
        {/* Résultats météo */}
        {weatherData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Météo économique - {weatherData.departmentName}
              </h3>
              <p className="text-gray-600">
                Données pour {new Date(new Date().getFullYear(), new Date().getMonth() - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Créations */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-green-800 mb-2">Créations</h4>
                <p className="text-3xl font-bold text-green-900">
                  {weatherData.creations.toLocaleString('fr-FR')}
                </p>
                <p className="text-sm text-green-700 mt-2">entreprises créées</p>
              </div>
              
              {/* Radiations */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <UserX className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-red-800 mb-2">Radiations</h4>
                <p className="text-3xl font-bold text-red-900">
                  {weatherData.radiations.toLocaleString('fr-FR')}
                </p>
                <p className="text-sm text-red-700 mt-2">entreprises radiées</p>
              </div>
              
              {/* Différence */}
              <div className={`border rounded-xl p-6 text-center ${
                weatherData.difference > 0 
                  ? 'bg-blue-50 border-blue-200' 
                  : weatherData.difference < 0 
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-center mb-4">
                  <Calculator className={`w-8 h-8 ${
                    weatherData.difference > 0 
                      ? 'text-blue-600' 
                      : weatherData.difference < 0 
                        ? 'text-orange-600'
                        : 'text-gray-600'
                  }`} />
                </div>
                <h4 className={`text-lg font-semibold mb-2 ${
                  weatherData.difference > 0 
                    ? 'text-blue-800' 
                    : weatherData.difference < 0 
                      ? 'text-orange-800'
                      : 'text-gray-800'
                }`}>
                  Différence
                </h4>
                <p className={`text-3xl font-bold ${
                  weatherData.difference > 0 
                    ? 'text-blue-900' 
                    : weatherData.difference < 0 
                      ? 'text-orange-900'
                      : 'text-gray-900'
                }`}>
                  {weatherData.difference > 0 ? '+' : ''}{weatherData.difference.toLocaleString('fr-FR')}
                </p>
                <p className={`text-sm mt-2 ${
                  weatherData.difference > 0 
                    ? 'text-blue-700' 
                    : weatherData.difference < 0 
                      ? 'text-orange-700'
                      : 'text-gray-700'
                }`}>
                  solde net
                </p>
              </div>
              
              {/* Météo */}
              <div className={`border rounded-xl p-6 text-center ${
                weatherData.weather === 'sunny' 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : weatherData.weather === 'rainy'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-center mb-4">
                  {getWeatherIcon(weatherData.weather)}
                </div>
                <h4 className={`text-lg font-semibold mb-2 ${
                  weatherData.weather === 'sunny' 
                    ? 'text-yellow-800' 
                    : weatherData.weather === 'rainy'
                      ? 'text-blue-800'
                      : 'text-gray-800'
                }`}>
                  Météo
                </h4>
                <p className={`text-2xl font-bold mb-2 ${
                  weatherData.weather === 'sunny' 
                    ? 'text-yellow-900' 
                    : weatherData.weather === 'rainy'
                      ? 'text-blue-900'
                      : 'text-gray-900'
                }`}>
                  {weatherData.weather === 'sunny' ? 'Ensoleillé' : 
                   weatherData.weather === 'rainy' ? 'Pluvieux' : 'Nuageux'}
                </p>
                <div className="flex items-center justify-center space-x-1">
                  {weatherData.evolution > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : weatherData.evolution < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    weatherData.evolution > 0 ? 'text-green-600' : 
                    weatherData.evolution < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {weatherData.evolution > 0 ? '+' : ''}{weatherData.evolution.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">vs mois précédent</p>
              </div>
            </div>
            
            {/* Explication de la météo */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Interprétation de la météo économique</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <span>
                    <strong>Ensoleillé</strong> : Évolution &gt; +10% des créations
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Cloud className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>Nuageux</strong> : Évolution entre -10% et +10%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CloudRain className="w-5 h-5 text-blue-500" />
                  <span>
                    <strong>Pluvieux</strong> : Évolution &lt; -10% des créations
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeatherTab;