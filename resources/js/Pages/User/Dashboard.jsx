import React, { useState, useEffect, useCallback } from 'react';
import UserLayout from './UserLayout';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { id as localeID } from 'date-fns/locale';

import { SENSOR_CONFIGS } from '../../Utils/constants';
import SensorSummaryCard from '../../Components/SensorSummaryCard';
// import SensorChart from '../../Components/SensorChart'; // TEMPORARY DISABLED
import HeaderGlobal from '../../Components/HeaderGlobal';
import FooterGlobal from '../../Components/FooterGlobal';
import { usePreferences } from '../../Contexts/PreferencesContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, TimeScale
);

function parseTimestampAntares(ts) {
  if (!ts) return null;
  if (ts.includes('-') && ts.includes('T')) return new Date(ts);
  const match = ts.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    const [_, y, m, d, h, min, s] = match;
    return new Date(`${y}-${m}-${d}T${h}:${min}:${s}Z`);
  }
  return null;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  // Use preferences
  const { 
    preferences, 
    getText, 
    convertTemperature, 
    getTemperatureUnit,
    formatTime 
  } = usePreferences();

  useEffect(() => {
    const updateInternalThemeState = () => {
      const htmlIsDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(htmlIsDark);
    };
    updateInternalThemeState();
    const observer = new MutationObserver(updateInternalThemeState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fetchData = useCallback(() => {
    if (dashboardData.length === 0) setLoadingData(true);
    setConnectionStatus('connecting');
    
    // Always fetch realtime data from Antares for Dashboard
    const apiUrl = '/api/antares/realtime';
    
    fetch(apiUrl, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errorData => {
            throw new Error(errorData.message || `Server error ${res.status}`);
          }).catch(() => {
            // If response is not JSON, try to parse as text
            return res.text().then(text => {
              const match = text.match(/<div class="ml-4 text-lg text-gray-500 uppercase tracking-wider">\s*([^<]+)\s*<\/div>/);
              const simpleError = match && match[1] ? match[1].trim() : `Server error ${res.status}`;
              throw new Error(`Error ${res.status}: ${simpleError}.`);
            });
          });
        }
        return res.json();
      })
      .then(apiResponse => {
        console.log('API Response:', apiResponse);
        console.log('API Response Source:', apiResponse.source);
        console.log('API Response Message:', apiResponse.message);
        
        if (apiResponse && apiResponse.status === 'success' && apiResponse.data) {
          const raw = apiResponse.data;
          console.log('Raw data from API:', raw);
          
          // Transform realtime data to sensor objects with temperature conversion
          const transformedData = Object.keys(SENSOR_CONFIGS).map(sensorKey => {
            const config = SENSOR_CONFIGS[sensorKey];
            let value = raw[sensorKey];
            
            // Convert temperature if it's temperature sensor
            if (sensorKey === 'temperature' && value !== undefined && value !== null) {
              value = convertTemperature(parseFloat(value));
            }
            
            return {
              sensor_type: sensorKey,
              label: config.label,
              unit: sensorKey === 'temperature' ? getTemperatureUnit() : config.unit,
              icon: config.icon,
              current_value: value !== undefined && value !== null ? parseFloat(value.toFixed(2)) : 'N/A',
              last_updated: raw.timestamp || raw.created_at || new Date().toISOString(),
              data_points: [{
                timestamp: new Date(raw.timestamp || raw.created_at),
                value: parseFloat(value || 0)
              }],
            };
          });

          setDashboardData(transformedData);
          setErrorData(null);
          setConnectionStatus('connected');
        } else if (apiResponse && apiResponse.status === 'error') {
          // Handle error response from API
          setErrorData(apiResponse.message || 'Error from Antares API');
          setConnectionStatus('error');
        } else {
          setErrorData('Format API response tidak sesuai.');
          setConnectionStatus('error');
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setErrorData(err.message || 'Gagal memuat data dari API.');
        setConnectionStatus('error');
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, [dashboardData.length, convertTemperature, getTemperatureUnit]);

  useEffect(() => {
    fetchData();
    // Use refresh interval from preferences
    const intervalId = setInterval(fetchData, preferences.dashboard.refreshInterval * 1000);
    return () => clearInterval(intervalId);
  }, [fetchData, preferences.dashboard.refreshInterval]);

  const lastUpdate = dashboardData.reduce((latest, s) => {
    if (s.last_updated && s.last_updated !== 'N/A') {
      const t = new Date(s.last_updated);
      if (!latest || t > latest) return t;
    }
    return latest;
  }, null);
  const lastUpdateStr = lastUpdate ? formatTime(lastUpdate) : null;

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'text-green-600 dark:text-green-400', icon: '🟢', text: 'Terhubung' };
      case 'connecting':
        return { color: 'text-yellow-600 dark:text-yellow-400', icon: '🟡', text: 'Menghubungkan...' };
      case 'error':
        return { color: 'text-red-600 dark:text-red-400', icon: '🔴', text: 'Terputus' };
      default:
        return { color: 'text-gray-600 dark:text-gray-400', icon: '⚪', text: 'Tidak diketahui' };
    }
  };

  const statusInfo = getConnectionStatusInfo();

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <HeaderGlobal
              title={getText('dashboard.title')}
              subtitle={getText('dashboard.subtitle')}
              online={true}
            />
          </div>

          {/* Status Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{statusInfo.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{getText('connection_status')}</p>
                    <p className={`font-semibold ${statusInfo.color}`}>{connectionStatus === 'connected' ? getText('connected') : statusInfo.text}</p>
                  </div>
                </div>
                
                {lastUpdate && (
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🕒</span>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{getText('last_update')}</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {lastUpdate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {' '}
                        {lastUpdate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    📡 {getText('realtime_data')}
                  </span>
                </div>
                <button
                  onClick={fetchData}
                  disabled={loadingData}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  <span className="text-lg">🔄</span>
                  <span>{loadingData ? getText('loading') : getText('refresh')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                <span className="text-4xl mr-4">📊</span>
                {getText('sensor_summary')}
              </h2>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg">
                <span className="font-semibold">{dashboardData.length} {getText('sensors_active')}</span>
              </div>
            </div>
            
            {/* Loading State */}
            {loadingData && dashboardData.length === 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">📡</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Memuat Data Sensor
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Mengambil data real-time dari server...
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error State */}
            {errorData && !loadingData && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <span className="text-6xl">⚠️</span>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                      Gagal Memuat Data
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {errorData}
                    </p>
                    <button
                      onClick={fetchData}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
                    >
                      <span className="text-lg">🔄</span>
                      <span>Coba Lagi</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Sensor Cards Grid */}
            {dashboardData.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {dashboardData.map(sensor => (
                  <div key={`summary-${sensor.sensor_type}`} className="transform transition-all duration-300 hover:scale-105">
                    <SensorSummaryCard
                      sensor={sensor}
                      config={SENSOR_CONFIGS[sensor.sensor_type]}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loadingData && !errorData && dashboardData.length === 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <span className="text-6xl">📊</span>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Tidak Ada Data Sensor
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Belum ada data sensor yang tersedia saat ini
                    </p>
                    <button
                      onClick={fetchData}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
                    >
                      <span className="text-lg">🔄</span>
                      <span>Refresh Data</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <FooterGlobal />
        </div>
      </div>
    </UserLayout>
  );
}
