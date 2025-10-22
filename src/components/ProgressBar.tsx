import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export function ProgressBar({ 
  progress, 
  className = '', 
  showPercentage = false,
  color = 'blue'
}: ProgressBarProps) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };

  const backgroundColorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
    red: 'bg-red-100 dark:bg-red-900/30'
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full h-2 ${backgroundColorClasses[color]} rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${colorClasses[color]} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="mt-1 text-right">
          <span className="text-xs text-gray-600 dark:text-gray-400">{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  );
}