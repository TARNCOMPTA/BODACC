import React from 'react';
import { FranceMapWeather } from './FranceMapWeather';

export function WeatherTab() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Météo économique de la France
          </h2>
          <p className="text-gray-600">
            Visualisez l'évolution des créations d'entreprises par département avec notre système de météo économique
          </p>
        </div>
        
        <FranceMapWeather />
      </div>
    </div>
  );
}