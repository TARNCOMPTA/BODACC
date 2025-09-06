import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BodaccApiService } from '../services/bodaccApi';

export interface DepartmentData {
  code: string;
  name: string;
  creations: number;
  previousCreations: number;
  evolution: number;
  weather: 'sunny' | 'cloudy' | 'rainy';
}

export function FranceMapWeather() {
  const [departmentsData, setDepartmentsData] = useState<DepartmentData[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEconomicWeatherData = async () => {
      try {
        const data = await BodaccApiService.getEconomicWeatherData();
        setDepartmentsData(data);
      } catch (error) {
        console.error('Erreur météo économique:', error);
        setDepartmentsData([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadEconomicWeatherData();
  }, []);

  const getWeatherIcon = (weather: 'sunny' | 'cloudy' | 'rainy', size = 'w-4 h-4') => {
    switch (weather) {
      case 'sunny':
        return <Sun className={`${size} text-yellow-500`} />;
      case 'cloudy':
        return <Cloud className={`${size} text-gray-500`} />;
      case 'rainy':
        return <CloudRain className={`${size} text-blue-500`} />;
    }
  };

  const getWeatherColor = (weather: 'sunny' | 'cloudy' | 'rainy') => {
    switch (weather) {
      case 'sunny':
        return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
      case 'cloudy':
        return 'bg-gray-100 border-gray-300 hover:bg-gray-200';
      case 'rainy':
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
    }
  };

  const getEvolutionIcon = (evolution: number) => {
    if (evolution > 10) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (evolution < -10) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const weatherStats = {
    sunny: departmentsData.filter(d => d.weather === 'sunny').length,
    cloudy: departmentsData.filter(d => d.weather === 'cloudy').length,
    rainy: departmentsData.filter(d => d.weather === 'rainy').length
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement de la météo économique...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Météo économique de la France
        </h3>
        <p className="text-gray-600">
          Évolution des créations d'entreprises par département ce mois-ci
        </p>
      </div>

      {/* Légende */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">Légende météo économique</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">
              <strong>Soleil</strong> : +10% ou plus de créations
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-gray-500" />
            <span className="text-sm">
              <strong>Nuageux</strong> : entre -10% et +10%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CloudRain className="w-5 h-5 text-blue-500" />
            <span className="text-sm">
              <strong>Pluie</strong> : -10% ou moins de créations
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Sun className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-sm text-yellow-700">Départements en croissance</p>
              <p className="text-2xl font-bold text-yellow-800">{weatherStats.sunny}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Cloud className="w-6 h-6 text-gray-500" />
            <div>
              <p className="text-sm text-gray-700">Départements stables</p>
              <p className="text-2xl font-bold text-gray-800">{weatherStats.cloudy}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CloudRain className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-blue-700">Départements en baisse</p>
              <p className="text-2xl font-bold text-blue-800">{weatherStats.rainy}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Carte des départements */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 mb-6">
        {departmentsData.map((dept) => (
          <button
            key={dept.code}
            onClick={() => setSelectedDepartment(dept)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${getWeatherColor(dept.weather)} ${
              selectedDepartment?.code === dept.code ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center space-x-1">
                {getWeatherIcon(dept.weather)}
                <span className="text-xs font-bold">{dept.code}</span>
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">
                {dept.name.length > 12 ? dept.name.substring(0, 12) + '...' : dept.name}
              </span>
              <div className="flex items-center space-x-1">
                {getEvolutionIcon(dept.evolution)}
                <span className={`text-xs font-semibold ${
                  dept.evolution > 10 ? 'text-green-600' : 
                  dept.evolution < -10 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {dept.evolution > 0 ? '+' : ''}{dept.evolution.toFixed(1)}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Détails du département sélectionné */}
      {selectedDepartment && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              {selectedDepartment.name} ({selectedDepartment.code})
            </h4>
            <div className="flex items-center space-x-2">
              {getWeatherIcon(selectedDepartment.weather, 'w-6 h-6')}
              <span className="text-sm font-medium text-gray-600">
                Météo économique
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Créations ce mois</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedDepartment.creations.toLocaleString('fr-FR')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Mois précédent</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedDepartment.previousCreations.toLocaleString('fr-FR')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2">
                {getEvolutionIcon(selectedDepartment.evolution)}
                <p className="text-sm text-gray-600">Évolution</p>
              </div>
              <p className={`text-2xl font-bold ${
                selectedDepartment.evolution > 10 ? 'text-green-600' : 
                selectedDepartment.evolution < -10 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {selectedDepartment.evolution > 0 ? '+' : ''}{selectedDepartment.evolution.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}