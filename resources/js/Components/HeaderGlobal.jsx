import React from 'react';
import { usePreferences } from '../Contexts/PreferencesContext';

export default function HeaderGlobal({ title, subtitle, online = false }) {
  const { getText, formatDate, formatTime } = usePreferences();
  
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);
  const formattedTime = formatTime(currentDate);

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {subtitle}
          </p>
        </div>
        
        <div className="flex flex-col items-end">
          {online && (
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-semibold text-lg">
                {getText('online')}
              </span>
            </div>
          )}
          
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {getText('current_time')}:
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 font-mono">
              {formattedDate}, {formattedTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
