import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-1">
            Erreur de chargement
          </h3>
          <p className="text-red-700 dark:text-red-300">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 focus:ring-2 focus:ring-red-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}