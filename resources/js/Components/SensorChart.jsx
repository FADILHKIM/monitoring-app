// resources/js/Components/SensorChart.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { usePreferences } from '../Contexts/PreferencesContext';
import axios from 'axios';
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

const SensorChart = ({ sensor, useExternalData = false, selectedTimeRange = '1h', onTimeRangeChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [internalTimeRange, setInternalTimeRange] = useState(selectedTimeRange);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getText, convertTemperature, getTemperatureUnit } = usePreferences();

  // Use external time range if provided, otherwise use internal
  const currentTimeRange = useExternalData ? selectedTimeRange : internalTimeRange;

  // Debug logging
  console.log('SensorChart received:', { sensor, selectedTimeRange: currentTimeRange, useExternalData });
  console.log('Data points:', sensor?.data_points?.length);

  // Time range options (database only, no real-time)
  const timeRangeOptions = [
    { value: '1h', label: '1 Jam', icon: '⏰' },
    { value: '6h', label: '6 Jam', icon: '🕕' },
    { value: '12h', label: '12 Jam', icon: '🕛' },
    { value: '1d', label: '1 Hari', icon: '📅' },
    { value: '15d', label: '15 Hari', icon: '🗓️' },
    { value: '1mo', label: '1 Bulan', icon: '🗃️' },
    { value: '3mo', label: '3 Bulan', icon: '📈' },
    { value: 'all', label: 'Semua Data', icon: '🗂️' }
  ];

  // Define fallback colors for each sensor type
  const getColorForSensor = (sensorType) => {
    const colorMap = {
      current_in: '#3b82f6',
      current_out: '#10b981',
      voltage_in: '#f59e0b',
      voltage_out: '#ef4444',
      temperature: '#8b5cf6',
      // lux: '#f97316',
      battery_percentage: '#06b6d4'
    };
    return colorMap[sensorType] || '#6b7280';
  };

  // Get localized sensor label with proper fallback
  const getLocalizedLabel = () => {
    const sensorLabels = {
      current_in: 'Arus Masuk',
      current_out: 'Arus Keluar', 
      voltage_in: 'Tegangan Masuk',
      voltage_out: 'Tegangan Keluar',
      temperature: 'Suhu',
      // lux: 'Intensitas Cahaya',
      battery_percentage: 'Persentase Baterai'
    };
    
    return sensorLabels[sensor.sensor_type] || sensor.sensor_type;
  };

  // Enhanced data averaging function for large datasets
  const averageDataPoints = (dataPoints, timeRange) => {
    if (!dataPoints || dataPoints.length === 0) {
      return dataPoints;
    }

    // Determine max points based on time range for optimal chart performance
    const getMaxPoints = (range) => {
      const maxPointsMap = {
        '1m': 20,    // Real-time, keep all points
        '3m': 30,    // Real-time, keep all points
        '10m': 50,   // Real-time, keep all points
        '1h': 60,    // 1 point per minute
        '6h': 72,    // 1 point per 5 minutes
        '1d': 96,    // 1 point per 15 minutes
        '1w': 168,   // 1 point per hour
        '1mo': 120,  // 1 point per 6 hours
        'all': 200   // Maximum 200 points for all data
      };
      return maxPointsMap[range] || 100;
    };

    const maxPoints = getMaxPoints(timeRange);
    
    if (dataPoints.length <= maxPoints) {
      return dataPoints;
    }

    const interval = Math.ceil(dataPoints.length / maxPoints);
    const averagedData = [];

    console.log(`Averaging ${dataPoints.length} points to ${maxPoints} points for ${timeRange}`);

    for (let i = 0; i < dataPoints.length; i += interval) {
      const chunk = dataPoints.slice(i, i + interval);
      if (chunk.length === 0) continue;

      // Calculate average value
      const avgValue = chunk.reduce((sum, point) => sum + parseFloat(point.value || 0), 0) / chunk.length;
      
      // Use middle timestamp for better time representation
      const avgTimestamp = new Date(chunk[Math.floor(chunk.length / 2)].timestamp);

      // Also calculate min/max for better data representation (could be used for error bars)
      const values = chunk.map(point => parseFloat(point.value || 0));
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);

      averagedData.push({
        value: avgValue,
        timestamp: avgTimestamp,
        min: minValue,
        max: maxValue,
        count: chunk.length // Number of original points averaged
      });
    }

    return averagedData;
  };

  // Fetch data for selected time range OR use external data (database only)
  const fetchSensorData = async (timeRange) => {
    if (!sensor?.sensor_type) return;

    // If using external data from parent, process it directly
    if (useExternalData && sensor.data_points) {
      setLoading(true);
      setError(null);
      try {
        // Apply data averaging for large datasets first
        const processedData = averageDataPoints(sensor.data_points, currentTimeRange);
        // Process external data points
        const chartPoints = processedData.map(point => {
          let value = parseFloat(point.value || 0);
          if (sensor.sensor_type === 'temperature' && typeof value === 'number') {
            value = convertTemperature(value);
          }
          return {
            x: new Date(point.timestamp),
            y: parseFloat(value.toFixed(2)),
            count: point.count || 1,
            min: point.min !== undefined ? (sensor.sensor_type === 'temperature' ? convertTemperature(point.min) : point.min) : value,
            max: point.max !== undefined ? (sensor.sensor_type === 'temperature' ? convertTemperature(point.max) : point.max) : value
          };
        });
        const color = getColorForSensor(sensor.sensor_type);
        const localizedLabel = getLocalizedLabel();
        const unit = sensor.sensor_type === 'temperature' ? getTemperatureUnit() : sensor.unit;
        setChartData({
          datasets: [{
            label: `${localizedLabel} (${unit})`,
            data: chartPoints,
            borderColor: color,
            backgroundColor: color + '20',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: color,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: isExpanded ? 3 : 2,
            pointHoverRadius: isExpanded ? 6 : 4,
          }]
        });
        setLoading(false);
        return;
      } catch (err) {
        setError('Failed to process sensor data');
        setChartData(null);
        setLoading(false);
        return;
      }
    }

    // If using external data but no data points available, show empty state
    if (useExternalData && (!sensor.data_points || sensor.data_points.length === 0)) {
      setChartData(null);
      setLoading(false);
      return;
    }

    // Fetch from database only
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/sensor-data/historical', {
        params: { range: timeRange }
      });
      const result = response.data;
      if (result.status !== 'success' || !result.data) {
        throw new Error(result.message || 'Invalid API response');
      }
      const histData = Array.isArray(result.data) ? result.data : [];
      const rawData = histData.map(item => ({
        timestamp: new Date(item.time_group || item.timestamp),
        value: parseFloat(item[sensor.sensor_type]) || 0
      })).filter(point => !isNaN(point.value));
      const processedData = averageDataPoints(rawData, timeRange);
      const chartPoints = processedData.map(point => {
        let value = parseFloat(point.value || 0);
        if (sensor.sensor_type === 'temperature' && typeof value === 'number') {
          value = convertTemperature(value);
        }
        return {
          x: new Date(point.timestamp),
          y: parseFloat(value.toFixed(2)),
          count: point.count || 1,
          min: point.min !== undefined ? (sensor.sensor_type === 'temperature' ? convertTemperature(point.min) : point.min) : value,
          max: point.max !== undefined ? (sensor.sensor_type === 'temperature' ? convertTemperature(point.max) : point.max) : value
        };
      });
      const color = getColorForSensor(sensor.sensor_type);
      const localizedLabel = getLocalizedLabel();
      const unit = sensor.sensor_type === 'temperature' ? getTemperatureUnit() : sensor.unit;
      setChartData({
        datasets: [{
          label: `${localizedLabel} (${unit})`,
          data: chartPoints,
          borderColor: color,
          backgroundColor: color + '20',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: isExpanded ? 3 : 2,
          pointHoverRadius: isExpanded ? 6 : 4,
        }]
      });
    } catch (err) {
      setError('Failed to fetch sensor data');
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when time range changes or when external data updates
  useEffect(() => {
    if (useExternalData) {
      // Only process external data, don't make HTTP calls
      if (sensor?.data_points) {
        fetchSensorData(currentTimeRange);
      }
    } else {
      // Fetch data from API only when not using external data
      fetchSensorData(currentTimeRange);
    }
  }, [currentTimeRange, sensor?.sensor_type, sensor?.data_points, useExternalData]);

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    if (useExternalData) {
      // If using external data, notify parent to refetch
      if (onTimeRangeChange) {
        onTimeRangeChange(newTimeRange);
      }
    } else {
      // If not using external data, update internal state
      setInternalTimeRange(newTimeRange);
    }
  };

  // Chart options with clean axes
  const chartOptions = useMemo(() => {
    const localizedLabel = getLocalizedLabel();
    const unit = sensor.sensor_type === 'temperature' ? getTemperatureUnit() : sensor.unit;

    // Determine time format based on selected range
    let timeFormat = 'HH:mm';
    let stepSize = 1;
    
    if (['1d', '1w', '1mo', 'all'].includes(currentTimeRange)) {
      timeFormat = 'dd/MM';
      stepSize = currentTimeRange === '1mo' || currentTimeRange === 'all' ? 7 : 1;
    } else if (['6h'].includes(currentTimeRange)) {
      timeFormat = 'HH:mm';
      stepSize = 60; // Every hour
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#374151',
            font: {
              size: 12,
              family: 'Inter, sans-serif'
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
              const dataPoint = context.raw;
              let label = `${localizedLabel}: ${value} ${unit}`;
              
              // Add averaging info if this point represents averaged data
              if (dataPoint.count && dataPoint.count > 1) {
                label += ` (avg of ${dataPoint.count} points)`;
              }
              
              return label;
            },
            afterLabel: function(context) {
              const dataPoint = context.raw;
              // Show min/max range if available
              if (dataPoint.min !== undefined && dataPoint.max !== undefined && dataPoint.min !== dataPoint.max) {
                return `Range: ${dataPoint.min.toFixed(1)} - ${dataPoint.max.toFixed(1)} ${unit}`;
              }
              return '';
            },
            title: function(context) {
              if (context.length > 0) {
                return new Date(context[0].parsed.x).toLocaleString('id-ID');
              }
              return '';
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
              day: 'dd/MM',
              week: 'dd/MM',
              month: 'MM/yy'
            },
            tooltipFormat: 'dd/MM/yyyy HH:mm',
            stepSize: stepSize
          },
          grid: {
            color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
            drawBorder: false,
          },
          ticks: {
            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
            maxTicksLimit: isExpanded ? 12 : 6,
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: false,
          grid: {
            color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
            drawBorder: false,
          },
          ticks: {
            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
            maxTicksLimit: isExpanded ? 8 : 5,
            callback: function(value) {
              return `${parseFloat(value).toFixed(1)} ${unit}`;
            },
            font: {
              size: 11
            }
          }
        }
      },
    };
  }, [sensor.sensor_type, sensor.unit, currentTimeRange, isExpanded, getText, convertTemperature, getTemperatureUnit]);

  const getCurrentValue = () => {
    if (!chartData?.datasets?.[0]?.data?.length) return 'N/A';
    
    const latestPoint = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
    return latestPoint?.y?.toFixed(2) || 'N/A';
  };

  // Get averaging information for display
  const getAveragingInfo = () => {
    if (!chartData?.datasets?.[0]?.data?.length) return '';
    
    const data = chartData.datasets[0].data;
    const hasAveragedData = data.some(point => point.count && point.count > 1);
    
    if (hasAveragedData) {
      const totalOriginalPoints = data.reduce((sum, point) => sum + (point.count || 1), 0);
      const averageRatio = totalOriginalPoints / data.length;
      
      if (averageRatio > 1.5) {
        return ` • ⚡ Averaged (${averageRatio.toFixed(1)}x compression)`;
      }
    }
    
    return '';
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const containerClass = isExpanded 
    ? "fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
    : "bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 transition-all duration-200 hover:shadow-xl";

  const contentClass = isExpanded
    ? "bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
    : "";

  const localizedLabel = getLocalizedLabel();
  const unit = sensor.sensor_type === 'temperature' ? getTemperatureUnit() : sensor.unit;
  const currentValue = getCurrentValue();

  // Loading state
  if (loading && !chartData) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center h-64 text-red-500">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  if (isExpanded) {
    return (
      <div className={containerClass} onClick={(e) => e.target === e.currentTarget && toggleExpand()}>
        <div className={contentClass}>
          {/* Enhanced Expanded Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-t-xl border-b border-gray-200 dark:border-slate-600">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                  <span className="text-4xl">{sensor.icon || '📊'}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {localizedLabel}
                  </h3>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mt-1">
                    Nilai Saat Ini: <span className="font-semibold text-blue-600 dark:text-blue-400">{currentValue} {unit}</span>
                  </p>
              <div className="flex items-center space-x-3 mt-3">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                   Historical
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {chartData?.datasets?.[0]?.data?.length || 0} data points
                  {getAveragingInfo()}
                </span>
              </div>
                </div>
              </div>
              
              <button
                onClick={toggleExpand}
                className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors shadow-sm"
                title="Tutup Chart"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Enhanced Time Range Selector */}
          <div className="p-6 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              📅 Pilih Rentang Waktu
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTimeRangeChange(option.value)}
                  className={`flex flex-col items-center space-y-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    currentTimeRange === option.value
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-105 shadow-sm'
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-xs">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart Container */}
          <div className="p-6">
            <div className="h-96 relative bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 p-4">
              {chartData ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-lg">Tidak ada data tersedia</p>
                    <p className="text-sm text-gray-400 mt-1">Cobalah memilih rentang waktu yang berbeda</p>
                  </div>
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 bg-white dark:bg-slate-800 bg-opacity-75 flex items-center justify-center rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-lg text-gray-600 dark:text-gray-400">Memuat data chart...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 px-6 py-4 border-b border-gray-200 dark:border-slate-600">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <span className="text-2xl">{sensor.icon || '📊'}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {localizedLabel}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium text-blue-600 dark:text-blue-400">{currentValue} {unit}</span>
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  📊 Historical
                </span>
                <span className="text-gray-400 dark:text-gray-500">
                  {getAveragingInfo()}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={toggleExpand}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors shadow-sm"
            title="Perbesar Chart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Time Range Selector with better styling */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
        <div className="flex flex-wrap gap-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeRangeChange(option.value)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentTimeRange === option.value
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-105 shadow-sm'
              }`}
            >
              <span className="text-xs">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart container */}
      <div className="p-6">
        <div className="h-64 relative">
          {chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">Tidak ada data tersedia</p>
              </div>
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 bg-white dark:bg-slate-800 bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Memuat data...</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Chart Footer */}
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 px-4 py-2 rounded-lg">
          <span>📊 {chartData?.datasets?.[0]?.data?.length || 0} data points</span>
          <span className="capitalize">{timeRangeOptions.find(r => r.value === currentTimeRange)?.label || currentTimeRange}</span>
        </div>
      </div>
    </div>
  );
};

export default SensorChart;