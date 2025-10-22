import React from 'react';
import { Scale } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">BODACC Explorer</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bulletin officiel des annonces civiles et commerciales</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Données officielles
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}