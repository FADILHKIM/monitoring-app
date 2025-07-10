// resources/js/Components/SensorChart.jsx
import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { usePreferences } from '../Contexts/PreferencesContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const SensorChart = ({ sensor, timeRange = '1h' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getText, convertTemperature, getTemperatureUnit } = usePreferences();

  // Debug logging
  console.log('SensorChart received:', { sensor, timeRange });
  console.log('Data points:', sensor?.data_points?.length);

  // Define fallback colors for each sensor type
  const getColorForSensor = (sensorType) => {
    const colorMap = {
      current_in: '#3b82f6',
      current_out: '#10b981',
      voltage_in: '#f59e0b',
      voltage_out: '#ef4444',
      temperature: '#8b5cf6',
      lux: '#f97316',
      battery_percentage: '#06b6d4'
    };
    return colorMap[sensorType] || '#6b7280';
  };

  // Get localized sensor label
  const getLocalizedLabel = () => {
    const labelKey = `sensor.${sensor.sensor_type}`;
    return getText(labelKey);
  };

  const chartData = useMemo(() => {
    const color = getColorForSensor(sensor.sensor_type);
    const localizedLabel = getLocalizedLabel();
    const unit = sensor.sensor_type === 'temperature' ? getTemperatureUnit() : sensor.unit;
    
    if (!sensor.data_points || sensor.data_points.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: `${localizedLabel} (${unit})`,
          data: [],
          borderColor: color,
          backgroundColor: color + '20',
          fill: true,
          tension: 0.3,
        }]
      };
    }

    // Process data with temperature conversion if needed
    const processedData = sensor.data_points.map(point => {
      let value = point.value;
      
      // Convert temperature if needed
      if (sensor.sensor_type === 'temperature' && typeof value === 'number') {
        value = convertTemperature(value);
      }
      
      return {
        x: new Date(point.timestamp),
        y: typeof value === 'number' ? parseFloat(value.toFixed(2)) : value
      };
    });

    return {
      datasets: [{
        label: `${localizedLabel} (${unit})`,
        data: processedData,
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: isExpanded ? 4 : 3,
        pointHoverRadius: isExpanded ? 8 : 6,
      }]
    };
  }, [sensor.data_points, sensor.sensor_type, sensor.unit, isExpanded, getText, convertTemperature, getTemperatureUnit]);

  const chartOptions = useMemo(() => {
    const localizedLabel = getLocalizedLabel();
    const unit = sensor.sensor_type === 'temperature' ? getTemperatureUnit() : sensor.unit;

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#374151',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: getColorForSensor(sensor.sensor_type),
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              return `${localizedLabel}: ${value} ${unit}`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            displayFormats: {
              minute: 'HH:mm',
              hour: 'HH:mm',
              day: 'DD/MM'
            }
          },
          grid: {
            color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
          },
          ticks: {
            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
          }
        },
        y: {
          beginAtZero: false,
          grid: {
            color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
          },
          ticks: {
            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
            callback: function(value) {
              return `${parseFloat(value).toFixed(1)} ${unit}`;
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };
  }, [sensor.sensor_type, sensor.unit, getText, convertTemperature, getTemperatureUnit]);

  const timeRanges = [
    { value: '1m', label: getText('chart.1m') },
    { value: '3m', label: getText('chart.3m') },
    { value: '10m', label: getText('chart.10m') },
    { value: '1h', label: getText('chart.1h') },
    { value: '6h', label: getText('chart.6h') },
    { value: '1d', label: getText('chart.1d') }
  ];

  const getCurrentValue = () => {
    if (sensor.sensor_type === 'temperature' && typeof sensor.current_value === 'number') {
      return convertTemperature(sensor.current_value).toFixed(2);
    }
    return typeof sensor.current_value === 'number' ? sensor.current_value.toFixed(2) : sensor.current_value;
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const containerClass = isExpanded 
    ? "fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
    : "bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6";

  const contentClass = isExpanded
    ? "bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
    : "";

  const localizedLabel = getLocalizedLabel();
  const unit = sensor.sensor_type === 'temperature' ? getTemperatureUnit() : sensor.unit;
  const currentValue = getCurrentValue();

  if (isExpanded) {
    return (
      <div className={containerClass} onClick={(e) => e.target === e.currentTarget && toggleExpand()}>
        <div className={contentClass}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{sensor.icon || '📊'}</span>
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  {localizedLabel}
                </h3>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  {getText('current_value')}: {currentValue} {unit}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Range: {timeRange}
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleExpand}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              title="Tutup"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{sensor.icon || '📊'}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {localizedLabel}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getText('current_value')}: {currentValue} {unit}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              📡 {getText('realtime')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {timeRanges.find(r => r.value === timeRange)?.label || timeRange}
          </div>
          
          <button
            onClick={toggleExpand}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            title="Perbesar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      {/* Chart Footer */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        {sensor.data_points?.length || 0} data points • Range: {timeRange}
      </div>
    </div>
  );
};

export default SensorChart;