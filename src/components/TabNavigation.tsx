import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, BarChart3, Home, CloudSun } from 'lucide-react';

export function TabNavigation() {
  const tabs = [
    {
      path: '/',
      name: 'Accueil',
      icon: Home,
    },
    {
      path: '/recherche',
      name: 'Recherche annonces',
      icon: Search,
    },
    {
      path: '/statistiques',
      name: 'Statistiques',
      icon: BarChart3,
    },
    {
      path: '/meteo',
      name: 'Météo',
      icon: CloudSun,
    },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Tabs">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
