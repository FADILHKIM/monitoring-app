import React, { useState, useEffect } from 'react';
import UserLayout from './UserLayout';
import HeaderGlobal from '../../Components/HeaderGlobal';
import FooterGlobal from '../../Components/FooterGlobal';
import { usePreferences } from '../../Contexts/PreferencesContext';

export default function RiwayatAktivitas() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalActivities: 0,
    loginCount: 0,
    exportCount: 0,
    failedLogins: 0
  });
  const [quickStats, setQuickStats] = useState({
    lastLogin: null,
    lastLogout: null,
    lastPasswordChange: null,
    lastExport: null
  });

  const { getText, formatDate, formatTime } = usePreferences();

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [filter, searchTerm]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/activity-logs?${params}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        setActivities(data.data || []);
      } else {
        console.error('Failed to fetch activities:', response.status);
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/activity-logs/stats', {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalActivities: data.totalActivities || 0,
          loginCount: data.loginCount || 0,
          exportCount: data.exportCount || 0,
          failedLogins: data.failedLogins || 0
        });
        setQuickStats(data.lastActivities || {});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getActivityIcon = (type, status) => {
    const icons = {
      login: status === 'success' ? '🔐' : '❌',
      logout: '🚪',
      password_change: '🔑',
      export_data: '📄',
      profile_update: '👤'
    };
    return icons[type] || '📝';
  };

  const getActivityColor = (type, status) => {
    if (status === 'failed') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    
    const colors = {
      login: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      logout: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      password_change: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
      export_data: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
      profile_update: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
    };
    return colors[type] || 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <HeaderGlobal
              title={getText('activity.title')}
              subtitle={getText('activity.subtitle')}
              online={true}
            />
          </div>

          {/* Quick Stats - Last Activities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🔐</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{getText('last_login')}</h3>
                  {quickStats.lastLogin ? (
                    <>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">
                        {formatTime(new Date(quickStats.lastLogin.timestamp))}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <span>🌐</span>
                          <span>{quickStats.lastLogin.ip_address}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>💻</span>
                          <span>{quickStats.lastLogin.device}</span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">{getText('no_login_recorded')}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🚪</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{getText('last_logout')}</h3>
                  {quickStats.lastLogout ? (
                    <>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">
                        {formatTime(new Date(quickStats.lastLogout.timestamp))}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <span>🌐</span>
                          <span>{quickStats.lastLogout.ip_address}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>💻</span>
                          <span>{quickStats.lastLogout.device}</span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">{getText('no_logout_recorded')}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🔑</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{getText('last_password_change')}</h3>
                  {quickStats.lastPasswordChange ? (
                    <>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">
                        {formatTime(new Date(quickStats.lastPasswordChange.timestamp))}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <span>🌐</span>
                          <span>{quickStats.lastPasswordChange.ip_address}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>💻</span>
                          <span>{quickStats.lastPasswordChange.device}</span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">{getText('never_changed')}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📄</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{getText('last_data_export')}</h3>
                  {quickStats.lastExport ? (
                    <>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">
                        {formatTime(new Date(quickStats.lastExport.timestamp))}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {quickStats.lastExport.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <span>🌐</span>
                          <span>{quickStats.lastExport.ip_address}</span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">{getText('no_export_recorded')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{getText('total_activities')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalActivities}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Login Berhasil</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.loginCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔐</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Data Export</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.exportCount}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Login Gagal</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.failedLogins}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                <span className="text-2xl mr-3">🔍</span>
                Filter & Pencarian
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari aktivitas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
                </div>
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                >
                  <option value="all">Semua Aktivitas</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="password_change">Ubah Password</option>
                  <option value="export_data">Export Data</option>
                  <option value="profile_update">Update Profil</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-purple-600 to-blue-600">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <span className="text-3xl mr-3">📝</span>
                Timeline Aktivitas
                <span className="ml-auto bg-white/20 px-3 py-1 rounded-lg text-sm">
                  {activities.length} aktivitas
                </span>
              </h2>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Memuat riwayat aktivitas...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="text-6xl mb-4">📋</span>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Tidak Ada Aktivitas
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || filter !== 'all' 
                      ? 'Tidak ada aktivitas yang sesuai dengan filter atau pencarian Anda' 
                      : 'Belum ada riwayat aktivitas yang tercatat'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="relative flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      {/* Timeline Line */}
                      {index !== activities.length - 1 && (
                        <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200 dark:bg-slate-600"></div>
                      )}
                      
                      {/* Activity Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getActivityColor(activity.type, activity.status)}`}>
                        <span className="text-xl">{getActivityIcon(activity.type, activity.status)}</span>
                      </div>
                      
                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {activity.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {activity.description}
                            </p>
                          </div>
                          
                          {activity.status === 'failed' && (
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-lg text-xs font-medium">
                              Gagal
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <span>🕒</span>
                            <span>{formatTimestamp(activity.timestamp)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span>🌐</span>
                            <span>{activity.ip_address}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span>💻</span>
                            <span>{activity.device}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <FooterGlobal />
        </div>
      </div>
    </UserLayout>
  );
}
