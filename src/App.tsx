import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { HomeTab } from './components/HomeTab';
import { SearchTab } from './components/SearchTab';
import { StatisticsTab } from './components/StatisticsTab';
import { WeatherTab } from './components/WeatherTab';
import { ToastContainer } from './components/ToastContainer';

const PAGE_TITLES: Record<string, string> = {
  '/': 'BODACC Explorer - Accueil',
  '/recherche': 'Recherche d\'annonces BODACC - BODACC Explorer',
  '/statistiques': 'Statistiques BODACC - BODACC Explorer',
  '/meteo': 'Météo économique - BODACC Explorer',
};

const PAGE_DESCRIPTIONS: Record<string, string> = {
  '/': 'Explorez et analysez les annonces officielles du Bulletin officiel des annonces civiles et commerciales (BODACC)',
  '/recherche': 'Recherchez et filtrez les annonces BODACC par entreprise, département, catégorie et période',
  '/statistiques': 'Analysez les tendances et évolutions des annonces BODACC avec des graphiques interactifs',
  '/meteo': 'Consultez la météo économique d\'un département basée sur les créations et radiations d\'entreprises',
};

function App() {
  const location = useLocation();
  useTheme();

  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];
    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      const description = PAGE_DESCRIPTIONS[location.pathname] || PAGE_DESCRIPTIONS['/'];
      metaDescription.setAttribute('content', description);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      const description = PAGE_DESCRIPTIONS[location.pathname] || PAGE_DESCRIPTIONS['/'];
      ogDescription.setAttribute('content', description);
    }

    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <TabNavigation />

      <main>
        <Routes>
          <Route path="/" element={<HomeTab />} />
          <Route path="/recherche" element={<SearchTab />} />
          <Route path="/statistiques" element={<StatisticsTab />} />
          <Route path="/meteo" element={<WeatherTab />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
