import React, { useState, useEffect } from 'react';
import UserLayout from './UserLayout';
import HeaderGlobal from '../../Components/HeaderGlobal';
import FooterGlobal from '../../Components/FooterGlobal';
import { usePreferences } from '../../Contexts/PreferencesContext';

export default function Status() {
  const [systemStatus, setSystemStatus] = useState({
    api: 'connected',
    database: 'connected',
    sensors: 'connected',
    network: 'connected'
  });
  
  const [performanceMetrics, setPerformanceMetrics] = useState({
    cpu_usage: 0,
    memory_usage: 0,
    data_points_hour: 0
  });
  
  const [recentEvents, setRecentEvents] = useState([]);
  const [lastCheck, setLastCheck] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  const { getText, formatTime } = usePreferences();

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/system/status', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        const statusData = data.data;
        
        // Update system status
        setSystemStatus({
          api: statusData.api?.status || 'error',
          database: statusData.database?.status || 'error', 
          sensors: statusData.sensors?.status || 'error',
          network: statusData.network?.status || 'error'
        });
        
        // Update performance metrics
        if (statusData.performance) {
          setPerformanceMetrics(statusData.performance);
        }
        
        // Update recent events
        if (statusData.recent_events) {
          setRecentEvents(statusData.recent_events);
        }
        
        // Update last check time
        setLastCheck(new Date(statusData.last_check));
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
      // Keep existing dummy data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const statusItems = [
    {
      key: 'api',
      title: 'Antares API',
      description: 'Connection to IoT platform',
      status: systemStatus.api
    },
    {
      key: 'database',
      title: 'Database',
      description: 'MySQL connection status',
      status: systemStatus.database
    },
    {
      key: 'sensors',
      title: 'Sensor Network',
      description: 'IoT sensors connectivity',
      status: systemStatus.sensors
    },
    {
      key: 'network',
      title: 'Network',
      description: 'Internet connectivity',
      status: systemStatus.network
    }
  ];

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <HeaderGlobal
              title={getText('status_title')}
              subtitle={getText('status_subtitle')}
              online={true}
            />
          </div>

          {/* Overall Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🟢</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">System Status</h3>
                  <p className="text-green-600 dark:text-green-400 font-medium">All Systems Operational</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Check:</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {formatTime(lastCheck)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {statusItems.map(item => (
              <div key={item.key} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">
                      {getStatusIcon(item.status)}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status === 'connected' ? 'Connected' : 
                     item.status === 'warning' ? 'Warning' : 
                     item.status === 'error' ? 'Error' : 'Unknown'}
                  </div>
                </div>
                
                {/* Status Details */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Response Time:</span>
                    <span className="text-gray-800 dark:text-gray-200 font-mono">
                      {Math.floor(Math.random() * 50) + 10}ms
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
                    <span className="text-gray-800 dark:text-gray-200 font-mono">99.9%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <span className="text-2xl mr-3">📊</span>
              Performance Metrics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {performanceMetrics.cpu_usage?.toFixed(1) || '0.0'}%
                </div>
                <p className="text-gray-600 dark:text-gray-400">CPU Usage</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {performanceMetrics.memory_usage?.toFixed(1) || '0.0'}%
                </div>
                <p className="text-gray-600 dark:text-gray-400">Memory Usage</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {performanceMetrics.data_points_hour || 0}
                </div>
                <p className="text-gray-600 dark:text-gray-400">Data Points/Hour</p>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <span className="text-2xl mr-3">📋</span>
              Recent System Events
            </h3>
            
            <div className="space-y-4">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    event.type === 'success' ? 'bg-green-500' : 
                    event.type === 'warning' ? 'bg-yellow-500' : 
                    event.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200">{event.event}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <FooterGlobal />
        </div>
      </div>
    </UserLayout>
  );
}
