import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DepartmentData {
  code: string;
  name: string;
  creations: number;
  previousCreations: number;
  evolution: number;
  weather: 'sunny' | 'cloudy' | 'rainy';
}

// Données simulées pour la démonstration
const generateMockData = (): DepartmentData[] => {
  const departments = [
    { code: '01', name: 'Ain' },
    { code: '02', name: 'Aisne' },
    { code: '03', name: 'Allier' },
    { code: '04', name: 'Alpes-de-Haute-Provence' },
    { code: '05', name: 'Hautes-Alpes' },
    { code: '06', name: 'Alpes-Maritimes' },
    { code: '07', name: 'Ardèche' },
    { code: '08', name: 'Ardennes' },
    { code: '09', name: 'Ariège' },
    { code: '10', name: 'Aube' },
    { code: '11', name: 'Aude' },
    { code: '12', name: 'Aveyron' },
    { code: '13', name: 'Bouches-du-Rhône' },
    { code: '14', name: 'Calvados' },
    { code: '15', name: 'Cantal' },
    { code: '16', name: 'Charente' },
    { code: '17', name: 'Charente-Maritime' },
    { code: '18', name: 'Cher' },
    { code: '19', name: 'Corrèze' },
    { code: '21', name: 'Côte-d\'Or' },
    { code: '22', name: 'Côtes-d\'Armor' },
    { code: '23', name: 'Creuse' },
    { code: '24', name: 'Dordogne' },
    { code: '25', name: 'Doubs' },
    { code: '26', name: 'Drôme' },
    { code: '27', name: 'Eure' },
    { code: '28', name: 'Eure-et-Loir' },
    { code: '29', name: 'Finistère' },
    { code: '30', name: 'Gard' },
    { code: '31', name: 'Haute-Garonne' },
    { code: '32', name: 'Gers' },
    { code: '33', name: 'Gironde' },
    { code: '34', name: 'Hérault' },
    { code: '35', name: 'Ille-et-Vilaine' },
    { code: '36', name: 'Indre' },
    { code: '37', name: 'Indre-et-Loire' },
    { code: '38', name: 'Isère' },
    { code: '39', name: 'Jura' },
    { code: '40', name: 'Landes' },
    { code: '41', name: 'Loir-et-Cher' },
    { code: '42', name: 'Loire' },
    { code: '43', name: 'Haute-Loire' },
    { code: '44', name: 'Loire-Atlantique' },
    { code: '45', name: 'Loiret' },
    { code: '46', name: 'Lot' },
    { code: '47', name: 'Lot-et-Garonne' },
    { code: '48', name: 'Lozère' },
    { code: '49', name: 'Maine-et-Loire' },
    { code: '50', name: 'Manche' },
    { code: '51', name: 'Marne' },
    { code: '52', name: 'Haute-Marne' },
    { code: '53', name: 'Mayenne' },
    { code: '54', name: 'Meurthe-et-Moselle' },
    { code: '55', name: 'Meuse' },
    { code: '56', name: 'Morbihan' },
    { code: '57', name: 'Moselle' },
    { code: '58', name: 'Nièvre' },
    { code: '59', name: 'Nord' },
    { code: '60', name: 'Oise' },
    { code: '61', name: 'Orne' },
    { code: '62', name: 'Pas-de-Calais' },
    { code: '63', name: 'Puy-de-Dôme' },
    { code: '64', name: 'Pyrénées-Atlantiques' },
    { code: '65', name: 'Hautes-Pyrénées' },
    { code: '66', name: 'Pyrénées-Orientales' },
    { code: '67', name: 'Bas-Rhin' },
    { code: '68', name: 'Haut-Rhin' },
    { code: '69', name: 'Rhône' },
    { code: '70', name: 'Haute-Saône' },
    { code: '71', name: 'Saône-et-Loire' },
    { code: '72', name: 'Sarthe' },
    { code: '73', name: 'Savoie' },
    { code: '74', name: 'Haute-Savoie' },
    { code: '75', name: 'Paris' },
    { code: '76', name: 'Seine-Maritime' },
    { code: '77', name: 'Seine-et-Marne' },
    { code: '78', name: 'Yvelines' },
    { code: '79', name: 'Deux-Sèvres' },
    { code: '80', name: 'Somme' },
    { code: '81', name: 'Tarn' },
    { code: '82', name: 'Tarn-et-Garonne' },
    { code: '83', name: 'Var' },
    { code: '84', name: 'Vaucluse' },
    { code: '85', name: 'Vendée' },
    { code: '86', name: 'Vienne' },
    { code: '87', name: 'Haute-Vienne' },
    { code: '88', name: 'Vosges' },
    { code: '89', name: 'Yonne' },
    { code: '90', name: 'Territoire de Belfort' },
    { code: '91', name: 'Essonne' },
    { code: '92', name: 'Hauts-de-Seine' },
    { code: '93', name: 'Seine-Saint-Denis' },
    { code: '94', name: 'Val-de-Marne' },
    { code: '95', name: 'Val-d\'Oise' }
  ];

  return departments.map(dept => {
    const baseCreations = Math.floor(Math.random() * 500) + 50;
    const evolutionPercent = (Math.random() - 0.5) * 40; // Entre -20% et +20%
    const previousCreations = Math.round(baseCreations / (1 + evolutionPercent / 100));
    
    let weather: 'sunny' | 'cloudy' | 'rainy';
    if (evolutionPercent > 10) {
      weather = 'sunny';
    } else if (evolutionPercent < -10) {
      weather = 'rainy';
    } else {
      weather = 'cloudy';
    }

    return {
      code: dept.code,
      name: dept.name,
      creations: baseCreations,
      previousCreations,
      evolution: evolutionPercent,
      weather
    };
  });
};

export function FranceMapWeather() {
  const [departmentsData, setDepartmentsData] = useState<DepartmentData[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setDepartmentsData(generateMockData());
      setIsLoading(false);
    }, 1000);
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