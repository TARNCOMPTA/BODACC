import React from 'react';
import { Search, BarChart3, Home, CloudSun } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'home' | 'search' | 'statistics' | 'weather';
  onTabChange: (tab: 'home' | 'search' | 'statistics' | 'weather') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    {
      id: 'home' as const,
      name: 'Accueil',
      icon: Home,
    },
    {
      id: 'search' as const,
      name: 'Recherche annonces',
      icon: Search,
    },
    {
      id: 'statistics' as const,
      name: 'Statistiques',
      icon: BarChart3,
    },
    {
      id: 'weather' as const,
      name: 'Météo',
      icon: CloudSun,
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Tabs">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}