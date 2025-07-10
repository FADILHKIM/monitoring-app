import React, { useState, useEffect, useCallback } from 'react';
import UserLayout from './UserLayout';
import FooterGlobal from '../../Components/FooterGlobal';
import SensorChart from '../../Components/SensorChart';
import { usePreferences } from '../../Contexts/PreferencesContext';

export default function Grafik() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentTimeRange, setCurrentTimeRange] = useState('1h');
  const [currentTime, setCurrentTime] = useState(new Date());

  const { 
    getText, 
    convertTemperature, 
    getTemperatureUnit 
  } = usePreferences();

  // Define all available sensors with their metadata
  const allSensors = [
    {
      sensor_type: 'current_in',
      icon: '⚡',
      unit: 'A',
      label: 'Arus Masuk'
    },
    {
      sensor_type: 'current_out',
      icon: '🔌',
      unit: 'A',
      label: 'Arus Keluar'
    },
    {
      sensor_type: 'voltage_in',
      icon: '🔋',
      unit: 'V',
      label: 'Tegangan Masuk'
    },
    {
      sensor_type: 'voltage_out',
      icon: '⚡',
      unit: 'V',
      label: 'Tegangan Keluar'
    },
    {
      sensor_type: 'temperature',
      icon: '🌡️',
      unit: '°C',
      label: 'Suhu'
    },
    // lux sensor removed
    {
      sensor_type: 'battery_percentage',
      icon: '🔋',
      unit: '%',
      label: 'Persentase Baterai'
    }
  ];

  // Time range options (mulai dari 1 jam, tidak ada real-time)
  const timeRangeOptions = [
    { value: '1h', label: '1 Jam' },
    { value: '6h', label: '6 Jam' },
    { value: '12h', label: '12 Jam' },
    { value: '24h', label: '24 Jam' },
    { value: '1d', label: '1 Hari' },
    { value: '15d', label: '15 Hari' },
    { value: '1mo', label: '1 Bulan' },
    { value: '3mo', label: '3 Bulan' },
    { value: 'all', label: 'Semua Data' }
  ];

  // Function to fetch data based on time range (selalu dari database)
  const fetchDataForRange = async (range) => {
    const endpoint = `/api/sensor-data/historical?range=${range}`;
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${endpoint}`);
      }
      const result = await response.json();
      if (result.status === 'success' && result.data) {
        return { data: result.data };
      } else {
        throw new Error(result.message || 'Invalid API response');
      }
    } catch (error) {
      console.error(`❌ Error fetching data:`, error);
      throw error;
    }
  };

  // Convert fetched data to chart format
  const convertToChartData = (fetchedData, timeRange = '1h') => {
    const histData = Array.isArray(fetchedData) ? fetchedData : [];
    return allSensors.map(sensor => {
      const sensorPoints = histData.map(item => ({
        timestamp: new Date(item.time_group || item.timestamp),
        value: parseFloat(item[sensor.sensor_type]) || 0
      })).filter(point => !isNaN(point.value));
      const currentValue = sensorPoints.length > 0 ? sensorPoints[sensorPoints.length - 1].value : 0;
      return {
        ...sensor,
        current_value: currentValue,
        data_points: sensorPoints
      };
    });
  };

  // Default fetch function
  const fetchSensorData = useCallback(async (timeRange = '1h') => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDataForRange(timeRange);
      const processedData = convertToChartData(result.data, timeRange);
      processedData.forEach(sensor => {
        if (sensor.data_points && sensor.data_points.length > 0) {
          sensor.current_value = sensor.data_points[sensor.data_points.length - 1].value;
        } else {
          sensor.current_value = 0;
        }
      });
      setChartData(processedData);
      setLastUpdate(new Date());
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    console.log('📊 Grafik component mounted');
    fetchSensorData('1h'); // Start with 1 hour data
  }, [fetchSensorData]);

  // Periodic refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('📊 Periodic refresh triggered');
      fetchSensorData(currentTimeRange); // Refresh with current time range
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [fetchSensorData, currentTimeRange]);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                <div className="flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                      Memuat Dashboard
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mengambil data sensor...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <FooterGlobal />
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md">
                <div className="text-center">
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full inline-block mb-4">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    Terjadi Kesalahan
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {error}
                  </p>
                  <button 
                    onClick={() => fetchSensorData('1h')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
          <FooterGlobal />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Header Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-8 text-white overflow-hidden relative">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                        <span className="text-4xl">📊</span>
                      </div>
                      <div>
                        <h1 className="text-4xl font-bold mb-2">
                          Sensor Analytics Dashboard
                        </h1>
                        <p className="text-xl text-blue-100">
                          Historical analysis with smart data averaging
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 mt-6">
                      {/* <div className="flex items-center text-green-300">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse shadow-lg"></div>
                        <span className="font-medium">📡 Real-time (1m-10m)</span>
                      </div> */}
                      <div className="flex items-center text-blue-200">
                        <div className="w-3 h-3 bg-blue-400 rounded-full mr-3 shadow-lg"></div>
                        <span className="font-medium">📊 Historical (1h+)</span>
                      </div>
                      <div className="flex items-center text-purple-200">
                        <div className="w-3 h-3 bg-purple-400 rounded-full mr-3 shadow-lg"></div>
                        <span className="font-medium">⚡ Smart Averaging</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-sm text-blue-100 mb-1">
                        Current Time
                      </div>
                      <div className="text-lg font-bold font-mono">
                        {currentTime.toLocaleString('id-ID')}
                      </div>
                      <div className="text-sm text-blue-100 mb-1 mt-3">
                        Last Update
                      </div>
                      <div className="text-sm font-medium">
                        {lastUpdate ? lastUpdate.toLocaleTimeString('id-ID') : 'Loading...'}
                      </div>
                      <div className="text-xs text-blue-200 mt-3 flex items-center justify-end">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500 bg-opacity-20 text-green-200">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          {chartData.length} sensors online
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid - Pass data yang sudah di-fetch ke SensorChart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
            {chartData.map((sensorData, index) => (
              <div key={sensorData.sensor_type || index}>
                {/* Pass complete sensor data including data_points */}
                <SensorChart 
                  sensor={sensorData}
                  useExternalData={true}
                  selectedTimeRange={currentTimeRange}
                  onTimeRangeChange={(timeRange) => {
                    // When time range changes in individual chart, refetch data for that range
                    console.log(`🔄 Time range changed to: ${timeRange}`);
                    setCurrentTimeRange(timeRange);
                    fetchSensorData(timeRange);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Enhanced Stats Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center justify-center">
              <span className="text-3xl mr-3">📈</span>
              Current Values Overview
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {chartData.map((sensor, index) => (
                <div key={sensor.sensor_type || index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 w-44 md:w-48 lg:w-52 xl:w-56 mx-2 my-2 flex-shrink-0">
                  <div className="text-center">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl mb-4 inline-block">
                      <span className="text-3xl">{sensor.icon}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-2">
                      {sensor.label || sensor.sensor_type}
                    </div>
                    <div className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                      {typeof sensor.current_value === 'number' ? sensor.current_value.toFixed(2) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {sensor.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>

        <FooterGlobal />
      </div>
    </UserLayout>
  );
}
