// resources/js/Components/SensorSummaryCard.jsx
import React from 'react';
import { usePreferences } from '../Contexts/PreferencesContext';

export default function SensorSummaryCard({ sensor, config }) {
  const { getText, convertTemperature, getTemperatureUnit } = usePreferences();

  if (!sensor || !config) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Get localized sensor label
  const getLocalizedLabel = () => {
    const labelKey = `sensor.${sensor.sensor_type}`;
    return getText(labelKey);
  };

  // Get value with proper conversion and unit
  const getDisplayValue = () => {
    let value = sensor.current_value;
    let unit = sensor.unit;

    // Convert temperature if needed
    if (sensor.sensor_type === 'temperature' && typeof value === 'number') {
      value = convertTemperature(value);
      unit = getTemperatureUnit();
    }

    if (value === 'N/A' || value === null || value === undefined) {
      return { value: 'N/A', unit: unit };
    }

    return { 
      value: typeof value === 'number' ? value.toFixed(2) : value, 
      unit: unit 
    };
  };

  const { value, unit } = getDisplayValue();
  const localizedLabel = getLocalizedLabel();

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{config.icon}</div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'N/A' 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
        }`}>
          {value === 'N/A' ? 'No Data' : 'Live'}
        </div>
      </div>
      
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {localizedLabel}
        </h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {unit}
          </span>
        </div>
      </div>
      
      {sensor.last_updated && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(sensor.last_updated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}