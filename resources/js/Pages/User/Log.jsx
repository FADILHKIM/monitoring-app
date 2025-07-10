import React, { useState, useEffect } from 'react';
import UserLayout from './UserLayout';
import HeaderGlobal from '../../Components/HeaderGlobal';
import FooterGlobal from '../../Components/FooterGlobal';
import { usePreferences } from '../../Contexts/PreferencesContext';

export default function Log({ logs = [], lastLogin, lastPasswordChange }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sensorLogs, setSensorLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 15;

  const { 
    getText, 
    formatDate, 
    formatTime, 
    convertTemperature, 
    getTemperatureUnit 
  } = usePreferences();

  const handleExport = () => {
    if (sensorLogs.length === 0) {
      alert('Tidak ada data untuk diekspor. Silakan pilih tanggal terlebih dahulu.');
      return;
    }
    
    let url = '/api/log/export';
    const params = [];
    if (startDate) params.push(`start=${startDate}`);
    if (endDate) params.push(`end=${endDate}`);
    if (params.length) url += '?' + params.join('&');
    window.open(url, '_blank');
  };

  const fetchSensorData = () => {
    if (!startDate && !endDate) {
      setSensorLogs([]);
      setTotalRecords(0);
      return;
    }

    setLoading(true);
    let url = '/api/sensor-data/log';
    const params = [];
    if (startDate) params.push(`start=${startDate}`);
    if (endDate) params.push(`end=${endDate}`);
    if (params.length) url += '?' + params.join('&');

    fetch(url, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(json => {
        if (json.status === 'success') {
          setSensorLogs(json.data || []);
          setTotalRecords(json.total || 0);
          setCurrentPage(1); // reset ke halaman awal
        } else {
          throw new Error(json.message || 'Failed to fetch data');
        }
      })
      .catch(error => {
        console.error('Error fetching sensor data:', error);
        alert('Gagal memuat data sensor: ' + error.message);
        setSensorLogs([]);
        setTotalRecords(0);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSensorData();
  }, [startDate, endDate]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return timestamp;
    }
  };

  const formatValue = (value, type = null) => {
    if (value === null || value === undefined) return '-';
    
    // Convert temperature if needed
    if (type === 'temperature' && typeof value === 'number') {
      const convertedValue = convertTemperature(value);
      return Number(convertedValue).toFixed(2);
    }
    
    if (typeof value === 'number') {
      return Number(value).toFixed(2);
    }
    return value;
  };

  const totalPages = Math.ceil(sensorLogs.length / itemsPerPage);
  const paginatedLogs = sensorLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helper: ambil timestamp yang benar dari lastLogin
  const getLastLoginDate = () => {
    if (!lastLogin) return null;
    // Cek properti yang tersedia: timestamp, created_at, atau lainnya
    if (lastLogin.timestamp) return lastLogin.timestamp;
    if (lastLogin.created_at) return lastLogin.created_at;
    return null;
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <HeaderGlobal
              title={getText('log.title')}
              subtitle={getText('log.subtitle')}
              online={true}
            />
          </div>

          {/* Account Activity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔐</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Login Terakhir</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {getLastLoginDate() ? formatDateTime(getLastLoginDate()) : 'Belum ada data'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔑</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Password Terakhir Diubah</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {lastPasswordChange ? new Date(lastPasswordChange.created_at).toLocaleString('id-ID') : 'Belum pernah diubah'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Export Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                <span className="text-2xl mr-3">📊</span>
                {getText('log.filter_export')}
              </h3>
              {totalRecords > 0 && (
                <div className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    {totalRecords.toLocaleString()} {getText('log.records_found')}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {getText('log.start_date')}
                </label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {getText('log.end_date')}
                </label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>

              <button 
                onClick={() => {
                  if (sensorLogs.length === 0) {
                    alert('Tidak ada data untuk diekspor. Silakan pilih tanggal terlebih dahulu.');
                    return;
                  }
                  let url = '/api/sensor-data/export/csv';
                  const params = [];
                  if (startDate) params.push(`start=${startDate}`);
                  if (endDate) params.push(`end=${endDate}`);
                  if (params.length) url += '?' + params.join('&');
                  window.open(url, '_blank');
                }} 
                disabled={loading || sensorLogs.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <span className="text-xl">📊</span>
                <span>{getText('log.export_csv')}</span>
              </button>

              <button 
                onClick={() => {
                  if (sensorLogs.length === 0) {
                    alert('Tidak ada data untuk diekspor. Silakan pilih tanggal terlebih dahulu.');
                    return;
                  }
                  let url = '/api/sensor-data/export/pdf';
                  const params = [];
                  if (startDate) params.push(`start=${startDate}`);
                  if (endDate) params.push(`end=${endDate}`);
                  if (params.length) url += '?' + params.join('&');
                  window.open(url, '_blank');
                }} 
                disabled={loading || sensorLogs.length === 0}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <span className="text-xl">📄</span>
                <span>{getText('log.export_pdf')}</span>
              </button>
            </div>
          </div>

          {/* Data Table Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <span className="text-3xl mr-3">📋</span>
                Log Data Sensor
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    {[
                      { label: getText('no'), width: 'w-16' },
                      { label: getText('timestamp'), width: 'w-48' },
                      { label: `${getText('sensor.current_in')} (${getText('unit.ampere')})`, width: 'w-32' },
                      { label: `${getText('sensor.current_out')} (${getText('unit.ampere')})`, width: 'w-32' },
                      { label: `${getText('sensor.voltage_in')} (${getText('unit.volt')})`, width: 'w-36' },
                      { label: `${getText('sensor.voltage_out')} (${getText('unit.volt')})`, width: 'w-36' },
                      { label: `${getText('sensor.temperature')} (${getTemperatureUnit()})`, width: 'w-24' },
                      // lux column removed
                      { label: `${getText('sensor.battery_percentage')} (${getText('unit.percent')})`, width: 'w-28' }
                    ].map((col, idx) => (
                      <th key={idx} className={`${col.width} px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wider`}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                          <span className="text-gray-500 dark:text-gray-400 text-lg">Memuat data sensor...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <span className="text-6xl">📊</span>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {!startDate && !endDate 
                              ? 'Pilih Rentang Tanggal' 
                              : getText('log.no_data')
                            }
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            {!startDate && !endDate 
                              ? getText('log.select_date_range')
                              : getText('log.no_data_period')
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {(currentPage - 1) * itemsPerPage + i + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right font-mono">
                          {formatValue(log.current_in)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right font-mono">
                          {formatValue(log.current_out)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right font-mono">
                          {formatValue(log.voltage_in)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right font-mono">
                          {formatValue(log.voltage_out)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right font-mono">
                          {formatValue(log.temperature, 'temperature')}
                        </td>
                        {/* lux column removed */}
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right font-mono">
                          {formatValue(log.battery_percentage)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sensorLogs.length)} dari {sensorLogs.length} data
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + idx;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
        
        <FooterGlobal />
      </div>
    </UserLayout>
  );
}
