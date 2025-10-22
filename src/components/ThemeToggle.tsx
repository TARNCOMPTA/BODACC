import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: React.ComponentType<any> }[] = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor }
  ];

  return (
    <div className="relative">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        aria-label="Sélectionner le thème"
      >
        {themes.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        {(() => {
          const currentTheme = themes.find(t => t.value === theme);
          const Icon = currentTheme?.icon || Sun;
          return <Icon className="w-4 h-4 text-gray-400" />;
        })()}
      </div>
    </div>
  );
}