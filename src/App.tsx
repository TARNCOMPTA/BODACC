import React, { useState } from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { HomeTab } from './components/HomeTab';
import { SearchTab } from './components/SearchTab';
import { StatisticsTab } from './components/StatisticsTab';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'statistics'>('home');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main>
        {activeTab === 'home' && <HomeTab onTabChange={setActiveTab} />}
        {activeTab === 'search' && <SearchTab />}
        {activeTab === 'statistics' && <StatisticsTab />}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>
              Données issues de l'API BODACC officielle • 
              <a 
                href="https://www.data.gouv.fr/fr/datasets/bodacc-c/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 ml-1"
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