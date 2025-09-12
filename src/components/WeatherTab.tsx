import React, { useState, useCallback } from 'react';
import { CloudSun, Search, Sun, Cloud, CloudRain, TrendingUp, TrendingDown, Minus, Building2, UserX, Calculator } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';
import { BodaccApiService } from '../services/bodaccApi';

// Liste des départements français
const DEPARTEMENTS_LIST = [
  { code: '01', name: '01 - Ain' },
  { code: '02', name: '02 - Aisne' },
  { code: '03', name: '03 - Allier' },
  { code: '04', name: '04 - Alpes-de-Haute-Provence' },
  { code: '05', name: '05 - Hautes-Alpes' },
  { code: '06', name: '06 - Alpes-Maritimes' },
  { code: '07', name: '07 - Ardèche' },
  { code: '08', name: '08 - Ardennes' },
  { code: '09', name: '09 - Ariège' },
  { code: '10', name: '10 - Aube' },
  { code: '11', name: '11 - Aude' },
  { code: '12', name: '12 - Aveyron' },
  { code: '13', name: '13 - Bouches-du-Rhône' },
  { code: '14', name: '14 - Calvados' },
  { code: '15', name: '15 - Cantal' },
  { code: '16', name: '16 - Charente' },
  { code: '17', name: '17 - Charente-Maritime' },
  { code: '18', name: '18 - Cher' },
  { code: '19', name: '19 - Corrèze' },
  { code: '21', name: '21 - Côte-d\'Or' },
  { code: '22', name: '22 - Côtes-d\'Armor' },
  { code: '23', name: '23 - Creuse' },
  { code: '24', name: '24 - Dordogne' },
  { code: '25', name: '25 - Doubs' },
  { code: '26', name: '26 - Drôme' },
  { code: '27', name: '27 - Eure' },
  { code: '28', name: '28 - Eure-et-Loir' },
  { code: '29', name: '29 - Finistère' },
  { code: '2A', name: '2A - Corse-du-Sud' },
  { code: '2B', name: '2B - Haute-Corse' },
  { code: '30', name: '30 - Gard' },
  { code: '31', name: '31 - Haute-Garonne' },
  { code: '32', name: '32 - Gers' },
  { code: '33', name: '33 - Gironde' },
  { code: '34', name: '34 - Hérault' },
  { code: '35', name: '35 - Ille-et-Vilaine' },
  { code: '36', name: '36 - Indre' },
  { code: '37', name: '37 - Indre-et-Loire' },
  { code: '38', name: '38 - Isère' },
  { code: '39', name: '39 - Jura' },
  { code: '40', name: '40 - Landes' },
  { code: '41', name: '41 - Loir-et-Cher' },
  { code: '42', name: '42 - Loire' },
  { code: '43', name: '43 - Haute-Loire' },
  { code: '44', name: '44 - Loire-Atlantique' },
  { code: '45', name: '45 - Loiret' },
  { code: '46', name: '46 - Lot' },
  { code: '47', name: '47 - Lot-et-Garonne' },
  { code: '48', name: '48 - Lozère' },
  { code: '49', name: '49 - Maine-et-Loire' },
  { code: '50', name: '50 - Manche' },
  { code: '51', name: '51 - Marne' },
  { code: '52', name: '52 - Haute-Marne' },
  { code: '53', name: '53 - Mayenne' },
  { code: '54', name: '54 - Meurthe-et-Moselle' },
  { code: '55', name: '55 - Meuse' },
  { code: '56', name: '56 - Morbihan' },
  { code: '57', name: '57 - Moselle' },
  { code: '58', name: '58 - Nièvre' },
  { code: '59', name: '59 - Nord' },
  { code: '60', name: '60 - Oise' },
  { code: '61', name: '61 - Orne' },
  { code: '62', name: '62 - Pas-de-Calais' },
  { code: '63', name: '63 - Puy-de-Dôme' },
  { code: '64', name: '64 - Pyrénées-Atlantiques' },
  { code: '65', name: '65 - Hautes-Pyrénées' },
  { code: '66', name: '66 - Pyrénées-Orientales' },
  { code: '67', name: '67 - Bas-Rhin' },
  { code: '68', name: '68 - Haut-Rhin' },
  { code: '69', name: '69 - Rhône' },
  { code: '70', name: '70 - Haute-Saône' },
  { code: '71', name: '71 - Saône-et-Loire' },
  { code: '72', name: '72 - Sarthe' },
  { code: '73', name: '73 - Savoie' },
  { code: '74', name: '74 - Haute-Savoie' },
  { code: '75', name: '75 - Paris' },
  { code: '76', name: '76 - Seine-Maritime' },
  { code: '77', name: '77 - Seine-et-Marne' },
  { code: '78', name: '78 - Yvelines' },
  { code: '79', name: '79 - Deux-Sèvres' },
  { code: '80', name: '80 - Somme' },
  { code: '81', name: '81 - Tarn' },
  { code: '82', name: '82 - Tarn-et-Garonne' },
  { code: '83', name: '83 - Var' },
  { code: '84', name: '84 - Vaucluse' },
  { code: '85', name: '85 - Vendée' },
  { code: '86', name: '86 - Vienne' },
  { code: '87', name: '87 - Haute-Vienne' },
  { code: '88', name: '88 - Vosges' },
  { code: '89', name: '89 - Yonne' },
  { code: '90', name: '90 - Territoire de Belfort' },
  { code: '91', name: '91 - Essonne' },
  { code: '92', name: '92 - Hauts-de-Seine' },
  { code: '93', name: '93 - Seine-Saint-Denis' },
  { code: '94', name: '94 - Val-de-Marne' },
  { code: '95', name: '95 - Val-d\'Oise' },
  { code: '971', name: '971 - Guadeloupe' },
  { code: '972', name: '972 - Martinique' },
  { code: '973', name: '973 - Guyane' },
  { code: '974', name: '974 - La Réunion' },
  { code: '976', name: '976 - Mayotte' }
];

interface WeatherData {
  departmentCode: string;
  departmentName: string;
  creations: number;
  radiations: number;
  difference: number;
  evolution: number;
  weather: 'sunny' | 'cloudy' | 'rainy';
}

export function WeatherTab() {
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
      // Période actuelle (décembre 2024)
      const currentStart = '2024-12-01';
      const currentEnd = '2024-12-31';
      
      // Période précédente (novembre 2024)
      const previousStart = '2024-11-01';
      const previousEnd = '2024-11-30';
      
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
                  {DEPARTEMENTS_LIST.map((dept) => (
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
              <p className="text-gray-600">Données pour décembre 2024</p>
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
                    <strong>Ensoleillé</strong> : Évolution > +10% des créations
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