import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { HomeTab } from './components/HomeTab';
import { SearchTab } from './components/SearchTab';
import { StatisticsTab } from './components/StatisticsTab';
import { WeatherTab } from './components/WeatherTab';
import { ToastContainer } from './components/ToastContainer';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'statistics' | 'weather'>('home');
  
  // Initialize theme
  useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main>
        {activeTab === 'home' && <HomeTab onTabChange={setActiveTab} />}
        {activeTab === 'search' && <SearchTab />}
        {activeTab === 'statistics' && <StatisticsTab />}
        {activeTab === 'weather' && <WeatherTab />}
      </main>
      
      <ToastContainer />
      
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Données issues de l'API BODACC officielle • 
              <a 
                href="https://www.data.gouv.fr/fr/datasets/bodacc-c/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ml-1"
              >
                Source: data.gouv.fr
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;