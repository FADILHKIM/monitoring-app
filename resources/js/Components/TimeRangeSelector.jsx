// resources/js/Components/TimeRangeSelector.jsx
import React from 'react';
import { RANGES } from '../Utils/constants'; // Sesuaikan path jika struktur folder berbeda

export default function TimeRangeSelector({ currentRange, onSelectRange }) {
  return (
    <div className="flex items-center space-x-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-md mb-6">
      {Object.entries(RANGES).map(([key, { label }]) => (
        <button
          key={key}
          onClick={() => onSelectRange(key)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400
            ${currentRange === key
              ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-md'
              : 'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}