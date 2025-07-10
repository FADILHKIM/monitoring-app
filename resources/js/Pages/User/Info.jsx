import React, { useState, useEffect } from 'react';
import UserLayout from './UserLayout';
import FooterGlobal from '../../Components/FooterGlobal';
import { usePreferences } from '../../Contexts/PreferencesContext';

export default function Info() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { getText } = usePreferences();

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
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
                        <span className="text-4xl">ℹ️</span>
                      </div>
                      <div>
                        <h1 className="text-4xl font-bold mb-2">
                          System Information
                        </h1>
                        <p className="text-xl text-blue-100">
                          Comprehensive IoT monitoring system documentation
                        </p>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Overview */}
          <div className="mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                  <span className="text-3xl">🔍</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white ml-4">
                  System Overview
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    📊 About This System
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    Sistem Monitoring IoT ini adalah solusi komprehensif untuk memantau berbagai parameter sensor secara real-time. 
                    Sistem ini mengintegrasikan platform Antares IoT dengan database lokal untuk menyediakan analisis data yang mendalam.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Dikembangkan menggunakan teknologi modern seperti Laravel, React, dan Chart.js untuk memberikan pengalaman 
                    pengguna yang optimal dengan visualisasi data yang interaktif.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    🎯 Key Features
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-600 dark:text-gray-400">Real-time sensor monitoring</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-600 dark:text-gray-400">Historical data analysis</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-600 dark:text-gray-400">Smart data averaging</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-600 dark:text-gray-400">Interactive charts & dashboards</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-600 dark:text-gray-400">Export data to CSV/Excel</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-600 dark:text-gray-400">Multi-language support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Architecture */}
          <div className="mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                  <span className="text-3xl">🏗️</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white ml-4">
                  Technical Architecture
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <span className="text-2xl">🖥️</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-lg text-center">Frontend</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">React 18 with Hooks</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">Inertia.js for SPA</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">Chart.js for visualization</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">Tailwind CSS for styling</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">Vite for build tooling</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <span className="text-2xl">⚙️</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-lg text-center">Backend</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">Laravel 10 Framework</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">RESTful API design</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">SQLite/MySQL database</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">Eloquent ORM</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">Queue system for background jobs</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <span className="text-2xl">📡</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-lg text-center">IoT Integration</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="text-purple-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">Antares IoT Platform</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-purple-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">HTTP/HTTPS protocols</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-purple-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">JSON data format</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-purple-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">Real-time data streaming</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-purple-500 mr-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400">ESP32 microcontroller support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Types */}
          <div className="mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                  <span className="text-3xl">🔌</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white ml-4">
                  Monitored Sensors
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">⚡</span>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white">Current Sensors</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Electrical current monitoring</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="text-gray-600 dark:text-gray-400">• Input Current (A)</li>
                    <li className="text-gray-600 dark:text-gray-400">• Output Current (A)</li>
                    <li className="text-gray-600 dark:text-gray-400">• Real-time monitoring</li>
                    <li className="text-gray-600 dark:text-gray-400">• Overcurrent detection</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">🔋</span>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white">Voltage Sensors</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Electrical voltage monitoring</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="text-gray-600 dark:text-gray-400">• Input Voltage (V)</li>
                    <li className="text-gray-600 dark:text-gray-400">• Output Voltage (V)</li>
                    <li className="text-gray-600 dark:text-gray-400">• Battery Percentage (%)</li>
                    <li className="text-gray-600 dark:text-gray-400">• Power quality monitoring</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">🌡️</span>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white">Environmental</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Environmental monitoring</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="text-gray-600 dark:text-gray-400">• Temperature (°C)</li>
                    <li className="text-gray-600 dark:text-gray-400">• Light Intensity (lx)</li>
                    <li className="text-gray-600 dark:text-gray-400">• Climate control</li>
                    <li className="text-gray-600 dark:text-gray-400">• Energy optimization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Data Processing */}
          <div className="mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                  <span className="text-3xl">⚡</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white ml-4">
                  Data Processing & Analytics
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    📊 Real-time Processing
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1">⚡</span>
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">Live Data Streaming</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Real-time data from Antares IoT (1m-10m intervals)</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1">🔄</span>
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">Auto Refresh</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Automatic data updates every 2 minutes</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1">📈</span>
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">Live Charts</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Interactive real-time visualizations</div>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    🗄️ Historical Analysis
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">📊</span>
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">Smart Averaging</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Intelligent data compression for better performance</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">📅</span>
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">Time Range Selection</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">From 1 hour to all historical data</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">💾</span>
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">Data Export</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Export to CSV, Excel formats</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* API Information */}
          <div className="mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                  <span className="text-3xl">🔗</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white ml-4">
                  API Endpoints
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    📡 Real-time Data
                  </h3>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      GET /api/antares/realtime
                    </code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Fetches current sensor values from Antares IoT platform
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    📊 Historical Data
                  </h3>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      GET /api/sensor-data/historical?range=1w
                    </code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Fetches historical sensor data with time range parameter
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    💾 Data Export
                  </h3>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      GET /api/sensor-data/export
                    </code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Export sensor data to CSV or Excel format
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    📈 Statistics
                  </h3>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      GET /api/sensor-data/stats
                    </code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Get statistical analysis of sensor data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Performance */}
          <div className="mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-red-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                  <span className="text-3xl">🔒</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white ml-4">
                  Security & Performance
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    🛡️ Security Features
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1">🔐</span>
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">HTTPS Encryption</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">All data transmitted over secure connections</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1">🔑</span>
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">API Authentication</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Secure API access with authentication tokens</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1">🚫</span>
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">Input Validation</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Comprehensive data validation and sanitization</div>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    ⚡ Performance Optimizations
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1">🚀</span>
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">Data Caching</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Intelligent caching for faster data retrieval</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1">📊</span>
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">Data Compression</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Smart averaging reduces data load</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1">⚡</span>
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">Lazy Loading</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Components load only when needed</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                  <span className="text-3xl">📞</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white ml-4">
                  Support & Contact
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-xl mb-4">
                    <span className="text-4xl">📧</span>
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-white mb-2">Technical Support</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    For technical issues and system support
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mt-2">
                    support@monitoring-system.com
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-green-50 dark:bg-slate-700 rounded-xl mb-4">
                    <span className="text-4xl">📚</span>
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-white mb-2">Documentation</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Comprehensive system documentation
                  </p>
                  <p className="text-green-600 dark:text-green-400 font-medium mt-2">
                    docs.monitoring-system.com
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-purple-50 dark:bg-slate-700 rounded-xl mb-4">
                    <span className="text-4xl">🔧</span>
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-white mb-2">Development</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Custom development and integration
                  </p>
                  <p className="text-purple-600 dark:text-purple-400 font-medium mt-2">
                    dev@monitoring-system.com
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
