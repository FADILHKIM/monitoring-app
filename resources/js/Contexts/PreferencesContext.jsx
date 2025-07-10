import React, { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

const defaultPreferences = {
  language: 'id',
  theme: 'system',
  notifications: {
    email: true,
    browser: true,
    sounds: false,
    dataAlerts: true
  },
  dashboard: {
    refreshInterval: 30,
    defaultTimeRange: '1h',
    showGrid: true,
    compactView: false
  },
  units: {
    temperature: 'celsius',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    animations: true
  }
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        // Cek apakah ada preferensi yang disimpan
        const savedPrefs = localStorage.getItem('userPreferences');
        // Cek juga app_locale yang mungkin disimpan terpisah
        const savedLocale = localStorage.getItem('app_locale');
        
        let loadedPrefs = defaultPreferences;
        
        if (savedPrefs) {
          const parsed = JSON.parse(savedPrefs);
          loadedPrefs = { ...defaultPreferences, ...parsed };
        }
        
        // Jika ada locale yang disimpan terpisah, gunakan itu
        if (savedLocale && !savedPrefs) {
          loadedPrefs.language = savedLocale;
        }
        
        setPreferences(loadedPrefs);
        
        // Set bahasa ke document untuk aksesibilitas
        if (loadedPrefs.language) {
          document.documentElement.lang = loadedPrefs.language;
        }
        
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    const applyTheme = () => {
      const { theme } = preferences;
      const root = document.documentElement;
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        // Use system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(systemPrefersDark ? 'dark' : 'light');
      } else {
        root.classList.add(theme);
      }
    };

    if (!isLoading) {
      applyTheme();
    }
  }, [preferences.theme, isLoading]);

  // Apply accessibility settings
  useEffect(() => {
    const applyAccessibility = () => {
      const { accessibility } = preferences;
      const root = document.documentElement;
      const body = document.body;
      
      // High contrast
      if (accessibility.highContrast) {
        body.classList.add('high-contrast');
        root.style.setProperty('--contrast-multiplier', '1.5');
      } else {
        body.classList.remove('high-contrast');
        root.style.setProperty('--contrast-multiplier', '1');
      }
      
      // Large text
      if (accessibility.largeText) {
        body.classList.add('large-text');
        root.style.fontSize = '18px';
      } else {
        body.classList.remove('large-text');
        root.style.fontSize = '16px';
      }
      
      // Animations
      if (!accessibility.animations) {
        body.classList.add('no-animations');
        root.style.setProperty('--animation-duration', '0s');
        root.style.setProperty('--transition-duration', '0s');
      } else {
        body.classList.remove('no-animations');
        root.style.setProperty('--animation-duration', '0.3s');
        root.style.setProperty('--transition-duration', '0.2s');
      }
    };

    if (!isLoading) {
      applyAccessibility();
    }
  }, [preferences.accessibility, isLoading]);

  // Update preferences and save to localStorage
  const updatePreferences = (newPreferences) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences };
      
      // Save to localStorage
      try {
        localStorage.setItem('userPreferences', JSON.stringify(updated));
        
        // Jika ada perubahan bahasa, simpan juga ke app_locale
        if (newPreferences.language) {
          localStorage.setItem('app_locale', newPreferences.language);
          document.documentElement.lang = newPreferences.language;
        }
        
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
      
      return updated;
    });
  };

  // Update nested preferences
  const updateNestedPreference = (category, key, value) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      };
      
      // Save to localStorage
      try {
        localStorage.setItem('userPreferences', JSON.stringify(updated));
        
        // Jika ada perubahan bahasa, simpan juga ke app_locale
        if (category === 'language' || (category === 'units' && key === 'language')) {
          localStorage.setItem('app_locale', value);
          document.documentElement.lang = value;
        }
        
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
      
      return updated;
    });
  };

  // Reset to default preferences
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    try {
      localStorage.setItem('userPreferences', JSON.stringify(defaultPreferences));
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  };

  // Format date according to user preference
  const formatDate = (date) => {
    const { dateFormat } = preferences.units;
    const dateObj = new Date(date);
    
    switch (dateFormat) {
      case 'MM/DD/YYYY':
        return dateObj.toLocaleDateString('en-US');
      case 'YYYY-MM-DD':
        return dateObj.toISOString().split('T')[0];
      case 'DD/MM/YYYY':
      default:
        return dateObj.toLocaleDateString('en-GB');
    }
  };

  // Format time according to user preference
  const formatTime = (date) => {
    const { timeFormat } = preferences.units;
    const dateObj = new Date(date);
    
    if (timeFormat === '12h') {
      return dateObj.toLocaleTimeString('en-US', { 
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return dateObj.toLocaleTimeString('en-GB', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Convert temperature according to user preference
  const convertTemperature = (celsius) => {
    const { temperature } = preferences.units;
    
    switch (temperature) {
      case 'fahrenheit':
        return (celsius * 9/5) + 32;
      case 'kelvin':
        return celsius + 273.15;
      case 'celsius':
      default:
        return celsius;
    }
  };

  // Get temperature unit symbol
  const getTemperatureUnit = () => {
    const { temperature } = preferences.units;
    
    switch (temperature) {
      case 'fahrenheit':
        return '°F';
      case 'kelvin':
        return 'K';
      case 'celsius':
      default:
        return '°C';
    }
  };

  // Get localized text based on language preference
  const getText = (key) => {
    const { language } = preferences;
    
    const translations = {
      // Dashboard
      'dashboard.title': {
        id: 'Dashboard Monitoring IoT',
        en: 'IoT Monitoring Dashboard',
        ms: 'Papan Pemuka Pemantauan IoT'
      },
      'dashboard.subtitle': {
        id: 'Pantau data sensor Anda secara real-time dan historis',
        en: 'Monitor your sensor data in real-time and historical',
        ms: 'Pantau data sensor anda secara masa nyata dan bersejarah'
      },
      'refresh': {
        id: 'Segarkan',
        en: 'Refresh',
        ms: 'Muat Semula'
      },
      'loading': {
        id: 'Memuat...',
        en: 'Loading...',
        ms: 'Memuatkan...'
      },
      
      // Sensor Labels
      'sensor.current_in': {
        id: 'Arus Masuk',
        en: 'Input Current',
        ms: 'Arus Masuk'
      },
      'sensor.current_out': {
        id: 'Arus Keluar',
        en: 'Output Current',
        ms: 'Arus Keluar'
      },
      'sensor.voltage_in': {
        id: 'Tegangan Masuk',
        en: 'Input Voltage',
        ms: 'Voltan Masuk'
      },
      'sensor.voltage_out': {
        id: 'Tegangan Keluar',
        en: 'Output Voltage',
        ms: 'Voltan Keluar'
      },
      'sensor.temperature': {
        id: 'Suhu',
        en: 'Temperature',
        ms: 'Suhu'
      },
      // 'sensor.lux' removed
      'sensor.battery_percentage': {
        id: 'Persentase Baterai',
        en: 'Battery Percentage',
        ms: 'Peratusan Bateri'
      },
      
      // Units
      'unit.ampere': {
        id: 'A',
        en: 'A',
        ms: 'A'
      },
      'unit.volt': {
        id: 'V',
        en: 'V',
        ms: 'V'
      },
      // 'unit.lux' removed
      'unit.percent': {
        id: '%',
        en: '%',
        ms: '%'
      },
      
      // Log Page
      'log.title': {
        id: 'Log Aktivitas & Data Sensor',
        en: 'Activity & Sensor Data Log',
        ms: 'Log Aktiviti & Data Sensor'
      },
      'log.subtitle': {
        id: 'Riwayat lengkap data sensor dan aktivitas akun Anda',
        en: 'Complete history of your sensor data and account activities',
        ms: 'Sejarah lengkap data sensor dan aktiviti akaun anda'
      },
      'log.filter_export': {
        id: 'Filter & Export Data Sensor',
        en: 'Filter & Export Sensor Data',
        ms: 'Tapis & Eksport Data Sensor'
      },
      'log.records_found': {
        id: 'records ditemukan',
        en: 'records found',
        ms: 'rekod dijumpai'
      },
      'log.start_date': {
        id: 'Tanggal Mulai',
        en: 'Start Date',
        ms: 'Tarikh Mula'
      },
      'log.end_date': {
        id: 'Tanggal Akhir',
        en: 'End Date',
        ms: 'Tarikh Akhir'
      },
      'log.export_csv': {
        id: 'Export CSV',
        en: 'Export CSV',
        ms: 'Eksport CSV'
      },
      'log.export_pdf': {
        id: 'Export PDF',
        en: 'Export PDF',
        ms: 'Eksport PDF'
      },
      'log.no_data': {
        id: 'Tidak Ada Data',
        en: 'No Data',
        ms: 'Tiada Data'
      },
      'log.select_date_range': {
        id: 'Silakan pilih tanggal mulai dan akhir untuk melihat data sensor',
        en: 'Please select start and end dates to view sensor data',
        ms: 'Sila pilih tarikh mula dan akhir untuk melihat data sensor'
      },
      'log.no_data_period': {
        id: 'Tidak ada data sensor untuk periode yang dipilih',
        en: 'No sensor data for the selected period',
        ms: 'Tiada data sensor untuk tempoh yang dipilih'
      },
      
      // Chart/Historical Page
      'chart.title': {
        id: 'Grafik & Analisis Data',
        en: 'Charts & Data Analysis',
        ms: 'Carta & Analisis Data'
      },
      'chart.subtitle': {
        id: 'Visualisasi data sensor dengan berbagai rentang waktu',
        en: 'Sensor data visualization with various time ranges',
        ms: 'Visualisasi data sensor dengan pelbagai julat masa'
      },
      'chart.time_range': {
        id: 'Rentang Waktu',
        en: 'Time Range',
        ms: 'Julat Masa'
      },
      'chart.1m': {
        id: '1 Menit',
        en: '1 Minute',
        ms: '1 Minit'
      },
      'chart.3m': {
        id: '3 Menit',
        en: '3 Minutes',
        ms: '3 Minit'
      },
      'chart.10m': {
        id: '10 Menit',
        en: '10 Minutes',
        ms: '10 Minit'
      },
      'chart.1h': {
        id: '1 Jam',
        en: '1 Hour',
        ms: '1 Jam'
      },
      'chart.6h': {
        id: '6 Jam',
        en: '6 Hours',
        ms: '6 Jam'
      },
      'chart.1d': {
        id: '1 Hari',
        en: '1 Day',
        ms: '1 Hari'
      },
      'chart.7d': {
        id: '7 Hari',
        en: '7 Days',
        ms: '7 Hari'
      },
      'chart.30d': {
        id: '30 Hari',
        en: '30 Days',
        ms: '30 Hari'
      },
      'chart.all': {
        id: 'Semua',
        en: 'All',
        ms: 'Semua'
      },
      
      // Activity History
      'activity.title': {
        id: 'Riwayat Aktivitas',
        en: 'Activity History',
        ms: 'Sejarah Aktiviti'
      },
      'activity.subtitle': {
        id: 'Pantau semua aktivitas akun dan sistem Anda',
        en: 'Monitor all your account and system activities',
        ms: 'Pantau semua aktiviti akaun dan sistem anda'
      },
      
      // Settings
      'settings.title': {
        id: 'Pengaturan Akun',
        en: 'Account Settings',
        ms: 'Tetapan Akaun'
      },
      'settings.subtitle': {
        id: 'Kelola preferensi dan keamanan akun Anda',
        en: 'Manage your account preferences and security',
        ms: 'Urus keutamaan dan keselamatan akaun anda'
      },
      'settings.password_security': {
        id: 'Keamanan Password',
        en: 'Password Security',
        ms: 'Keselamatan Kata Laluan'
      },
      'settings.password_description': {
        id: 'Ubah password untuk menjaga keamanan akun Anda',
        en: 'Change password to keep your account secure',
        ms: 'Tukar kata laluan untuk menjaga keselamatan akaun anda'
      },
      'settings.password_requirements': {
        id: 'Persyaratan Password',
        en: 'Password Requirements',
        ms: 'Keperluan Kata Laluan'
      },
      'settings.password_req_1': {
        id: 'Minimal 6 karakter',
        en: 'Minimum 6 characters',
        ms: 'Minimum 6 aksara'
      },
      'settings.password_req_2': {
        id: 'Mengandung huruf besar dan kecil',
        en: 'Contains uppercase and lowercase letters',
        ms: 'Mengandungi huruf besar dan kecil'
      },
      'settings.password_req_3': {
        id: 'Mengandung angka dan karakter spesial',
        en: 'Contains numbers and special characters',
        ms: 'Mengandungi nombor dan aksara khas'
      },
      'settings.old_password': {
        id: 'Password Lama',
        en: 'Old Password',
        ms: 'Kata Laluan Lama'
      },
      'settings.new_password': {
        id: 'Password Baru',
        en: 'New Password',
        ms: 'Kata Laluan Baru'
      },
      'settings.confirm_password': {
        id: 'Konfirmasi Password Baru',
        en: 'Confirm New Password',
        ms: 'Sahkan Kata Laluan Baru'
      },
      'settings.saving': {
        id: 'Menyimpan...',
        en: 'Saving...',
        ms: 'Menyimpan...'
      },
      'settings.save_changes': {
        id: 'Simpan Perubahan',
        en: 'Save Changes',
        ms: 'Simpan Perubahan'
      },
      'settings.password_changed': {
        id: 'Password berhasil diubah.',
        en: 'Password successfully changed.',
        ms: 'Kata laluan berjaya ditukar.'
      },
      
      // Common
      'total_activities': {
        id: 'Total Aktivitas',
        en: 'Total Activities',
        ms: 'Jumlah Aktiviti'
      },
      'no': {
        id: 'No',
        en: 'No',
        ms: 'No'
      },
      'timestamp': {
        id: 'Timestamp',
        en: 'Timestamp',
        ms: 'Cap Masa'
      },
      'showing': {
        id: 'Menampilkan',
        en: 'Showing',
        ms: 'Menunjukkan'
      },
      'of': {
        id: 'dari',
        en: 'of',
        ms: 'daripada'
      },
      'data': {
        id: 'data',
        en: 'data',
        ms: 'data'
      },
      'previous': {
        id: 'Previous',
        en: 'Previous',
        ms: 'Sebelumnya'
      },
      'next': {
        id: 'Next',
        en: 'Next',
        ms: 'Seterusnya'
      },
      
      // Dashboard specific
      'online': {
        id: 'Online',
        en: 'Online',
        ms: 'Dalam Talian'
      },
      'current_time': {
        id: 'Waktu sekarang',
        en: 'Current time',
        ms: 'Masa sekarang'
      },
      'connection_status': {
        id: 'Status Koneksi',
        en: 'Connection Status',
        ms: 'Status Sambungan'
      },
      'connected': {
        id: 'Terhubung',
        en: 'Connected',
        ms: 'Disambung'
      },
      'last_update': {
        id: 'Update Terakhir',
        en: 'Last Update',
        ms: 'Kemaskini Terakhir'
      },
      'realtime_data': {
        id: 'Real-time Data',
        en: 'Real-time Data',
        ms: 'Data Masa Nyata'
      },
      'debug_information': {
        id: 'Debug Information',
        en: 'Debug Information',
        ms: 'Maklumat Debug'
      },
      'data_count': {
        id: 'Data Count',
        en: 'Data Count',
        ms: 'Kiraan Data'
      },
      'loading_status': {
        id: 'Loading',
        en: 'Loading',
        ms: 'Memuatkan'
      },
      'status': {
        id: 'Status',
        en: 'Status',
        ms: 'Status'
      },
      'source': {
        id: 'Source',
        en: 'Source',
        ms: 'Sumber'
      },
      'sensor_summary': {
        id: 'Ringkasan Sensor',
        en: 'Sensor Summary',
        ms: 'Ringkasan Sensor'
      },
      'sensors_active': {
        id: 'Sensor Aktif',
        en: 'Sensors Active',
        ms: 'Sensor Aktif'
      },
      
      // Chart/Historical page
      'chart_title': {
        id: 'Grafik Data Sensor',
        en: 'Sensor Data Charts',
        ms: 'Carta Data Sensor'
      },
      'chart_subtitle': {
        id: 'Visualisasi data historis dan realtime semua sensor',
        en: 'Historical and real-time data visualization of all sensors',
        ms: 'Visualisasi data bersejarah dan masa nyata semua sensor'
      },
      'current_value': {
        id: 'Nilai saat ini',
        en: 'Current value',
        ms: 'Nilai semasa'
      },
      'realtime': {
        id: 'Real-time',
        en: 'Real-time',
        ms: 'Masa Nyata'
      },
      
      // Activity page specific
      'last_login': {
        id: 'Login Terakhir',
        en: 'Last Login',
        ms: 'Log Masuk Terakhir'
      },
      'last_logout': {
        id: 'Logout Terakhir',
        en: 'Last Logout',
        ms: 'Log Keluar Terakhir'
      },
      'last_password_change': {
        id: 'Password Terakhir Diubah',
        en: 'Last Password Change',
        ms: 'Perubahan Kata Laluan Terakhir'
      },
      'last_data_export': {
        id: 'Export Data Terakhir',
        en: 'Last Data Export',
        ms: 'Eksport Data Terakhir'
      },
      'no_data_recorded': {
        id: 'Belum ada data',
        en: 'No data recorded',
        ms: 'Tiada data direkod'
      },
      'never_changed': {
        id: 'Belum pernah diubah',
        en: 'Never changed',
        ms: 'Tidak pernah diubah'
      },
      'no_login_recorded': {
        id: 'Belum ada login yang tercatat',
        en: 'No login recorded',
        ms: 'Tiada log masuk direkod'
      },
      'no_logout_recorded': {
        id: 'Belum ada logout yang tercatat',
        en: 'No logout recorded',
        ms: 'Tiada log keluar direkod'
      },
      'no_export_recorded': {
        id: 'Belum ada export data yang tercatat',
        en: 'No data export recorded',
        ms: 'Tiada eksport data direkod'
      },
      
      // Status page
      'status_title': {
        id: 'Status Sistem & Koneksi',
        en: 'System & Connection Status',
        ms: 'Status Sistem & Sambungan'
      },
      'status_subtitle': {
        id: 'Informasi real-time tentang status sistem dan koneksi sensor',
        en: 'Real-time information about system and sensor connection status',
        ms: 'Maklumat masa nyata tentang status sistem dan sambungan sensor'
      }
    };
    
    return translations[key]?.[language] || key;
  };

  const value = {
    preferences,
    isLoading,
    updatePreferences,
    updateNestedPreference,
    resetPreferences,
    formatDate,
    formatTime,
    convertTemperature,
    getTemperatureUnit,
    getText
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};