import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import UserLayout from './UserLayout';
import HeaderGlobal from '../../Components/HeaderGlobal';
import FooterGlobal from '../../Components/FooterGlobal';
import { usePreferences } from '../../Contexts/PreferencesContext';

// Custom event untuk perubahan bahasa
const LANGUAGE_CHANGE_EVENT = 'app:languageChanged';

export default function Preferensi({ preferences: initialPreferences }) {
  // Gunakan PreferencesContext untuk mendapatkan fungsi yang sudah ada
  const { 
    preferences: contextPreferences, 
    updatePreferences: updateContextPreferences,
    updateNestedPreference: updateContextNestedPreference,
    getText, 
    convertTemperature, 
    getTemperatureUnit,
    formatTime 
  } = usePreferences();

  const [preferences, setPreferences] = useState(initialPreferences || contextPreferences);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Pastikan bahasa aplikasi sesuai dengan preferensi pengguna saat komponen dimuat
  useEffect(() => {
    // Sinkronkan preferences dari context jika ada perubahan
    if (contextPreferences.language !== preferences.language) {
      setPreferences(contextPreferences);
    }
    
    // Perbarui locale di localStorage sesuai dengan preferensi bahasa saat ini
    if (contextPreferences.language) {
      // Simpan bahasa saat ini ke localStorage untuk digunakan oleh seluruh aplikasi
      localStorage.setItem('app_locale', contextPreferences.language);
      document.documentElement.lang = contextPreferences.language;
    }
  }, [contextPreferences.language]);

  const updateNestedPreference = (category, key, value) => {
    // Update state lokal dan context
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    updateContextNestedPreference(category, key, value);
    
    // Simpan ke database
    saveToDatabase({ [category]: { [key]: value } });
  };

  const updatePreferences = (newPrefs) => {
    // Update state lokal dan context
    setPreferences(prev => ({ ...prev, ...newPrefs }));
    updateContextPreferences(newPrefs);
    
    // Simpan ke database
    saveToDatabase(newPrefs);
  };

  const saveToDatabase = async (prefsToSave) => {
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({ preferences: prefsToSave })
      });
      
      if (response.ok) {
        showSavedFeedback();          // Jika preferensi yang disimpan termasuk bahasa, perbarui locale di localStorage
        if (prefsToSave.language) {
          localStorage.setItem('app_locale', prefsToSave.language);
          document.documentElement.lang = prefsToSave.language;
        }
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handlePreferenceChange = (category, key, value) => {
    // Update state lokal dan context
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    updateContextNestedPreference(category, key, value);
    
    // Simpan ke database
    saveToDatabase({ [category]: { [key]: value } });
  };

  const handleDirectChange = (key, value) => {
    // Update state lokal dan context
    setPreferences(prev => ({ ...prev, [key]: value }));
    updateContextPreferences({ [key]: value });
    
    // Simpan ke database
    saveToDatabase({ [key]: value });
    
    // Khusus untuk perubahan bahasa, refresh halaman untuk menerapkan perubahan ke seluruh aplikasi
    if (key === 'language') {
      // Simpan bahasa yang dipilih ke localStorage untuk digunakan oleh seluruh aplikasi
      localStorage.setItem('app_locale', value);
      document.documentElement.lang = value;
      
      // Tunda refresh untuk memberikan waktu penyimpanan preferensi
      setTimeout(() => {
        router.reload({ only: [] });
      }, 300);
    }
  };

  const showSavedFeedback = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const savePreferences = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({ preferences })
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        
        // Jika ada perubahan bahasa, perbarui locale dan kirim event
        if (preferences.language) {
          localStorage.setItem('app_locale', preferences.language);
          document.documentElement.lang = preferences.language;
          
          // Dispatch custom event untuk perubahan bahasa
          window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { 
            detail: { language: preferences.language }
          }));
          
          // Refresh halaman untuk menerapkan perubahan bahasa ke seluruh aplikasi
          // Tidak perlu refresh di sini karena sudah ada di handleDirectChange
        }
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Apakah Anda yakin ingin mereset semua preferensi ke default?')) {
      try {
        const response = await fetch('/api/preferences/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const previousLanguage = preferences.language;
          setPreferences(data.preferences);
          showSavedFeedback();
          
          // Jika bahasa berubah setelah reset, terapkan perubahan
          if (data.preferences.language && data.preferences.language !== previousLanguage) {
            localStorage.setItem('app_locale', data.preferences.language);
            document.documentElement.lang = data.preferences.language;
            
            // Update context preferences juga
            updateContextPreferences(data.preferences);
            
            // Dispatch custom event untuk perubahan bahasa
            window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { 
              detail: { language: data.preferences.language }
            }));
            
            // Refresh halaman untuk menerapkan perubahan bahasa
            setTimeout(() => {
              router.reload({ only: [] });
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error resetting preferences:', error);
      }
    }
  };

  const PreferenceCard = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectInput = ({ value, onChange, options, label, description }) => (
    <div className="py-3">
      <label className="block font-medium text-gray-900 dark:text-gray-100 mb-2">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{description}</p>
      )}
      <select
        value={typeof value === 'string' || typeof value === 'number' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <HeaderGlobal
              title="Preferensi & Personalisasi"
              subtitle="Sesuaikan pengalaman Anda dengan mengatur preferensi sistem"
              online={true}
            />
          </div>

          {/* Save/Reset Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Pengaturan Preferensi
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Perubahan akan disimpan otomatis dan diterapkan langsung
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  🔄 Reset Default
                </button>
                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2 ${
                    saved 
                      ? 'bg-green-600 text-white' 
                      : saving 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : saved ? (
                    <>
                      <span>✅</span>
                      <span>Tersimpan!</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Simpan Manual</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">👁️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Live Preview</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🌡️ Suhu Sample</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {convertTemperature(25).toFixed(1)}{getTemperatureUnit()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  25°C dikonversi ke {preferences.units?.temperature === 'fahrenheit' ? 'Fahrenheit' : 
                  preferences.units?.temperature === 'kelvin' ? 'Kelvin' : 'Celsius'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🕒 Waktu Sample</h4>
                <p className="text-lg font-mono text-green-600 dark:text-green-400">
                  {formatTime(new Date())}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Format: {preferences.units?.timeFormat === '12h' ? '12 Jam' : '24 Jam'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🌐 Bahasa</h4>
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {getText('dashboard.title')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Bahasa aktif: {preferences.language === 'id' ? 'Indonesia' : preferences.language === 'en' ? 'English' : 'Malaysia'}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</span>
                <div>
                  <h5 className="font-medium text-blue-800 dark:text-blue-200">Status Preferensi</h5>
                  <div className="text-sm text-blue-600 dark:text-blue-300 mt-2 space-y-1">
                    <p>🎨 Tema: <strong>{preferences.theme === 'system' ? 'Mengikuti Sistem' : preferences.theme === 'dark' ? 'Gelap' : 'Terang'}</strong></p>
                    <p>♿ Aksesibilitas: 
                      {preferences.accessibility?.highContrast && ' Kontras Tinggi'}
                      {preferences.accessibility?.largeText && ' Teks Besar'}
                      {!preferences.accessibility?.animations && ' Tanpa Animasi'}
                      {!preferences.accessibility?.highContrast && !preferences.accessibility?.largeText && preferences.accessibility?.animations && ' Default'}
                    </p>
                    <p>🔄 Refresh Dashboard: <strong>Setiap {Number(preferences.dashboard?.refreshInterval || 30)} detik</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Language & Localization */}
            <PreferenceCard icon="🌐" title="Bahasa & Lokalisasi">
              <div className="space-y-4">
                <SelectInput
                  value={preferences.language || 'id'}
                  onChange={(value) => handleDirectChange('language', value)}
                  label="Bahasa Interface"
                  description="Pilih bahasa untuk tampilan aplikasi"
                  options={[
                    { value: 'id', label: '🇮🇩 Bahasa Indonesia' },
                    { value: 'en', label: '🇺🇸 English' },
                    { value: 'ms', label: '🇲🇾 Bahasa Malaysia' }
                  ]}
                />
                
                <SelectInput
                  value={preferences.units?.dateFormat || 'DD/MM/YYYY'}
                  onChange={(value) => handlePreferenceChange('units', 'dateFormat', value)}
                  label="Format Tanggal"
                  options={[
                    { value: 'DD/MM/YYYY', label: '31/12/2025 (DD/MM/YYYY)' },
                    { value: 'MM/DD/YYYY', label: '12/31/2025 (MM/DD/YYYY)' },
                    { value: 'YYYY-MM-DD', label: '2025-12-31 (YYYY-MM-DD)' }
                  ]}
                />
                
                <SelectInput
                  value={preferences.units?.timeFormat || '24h'}
                  onChange={(value) => handlePreferenceChange('units', 'timeFormat', value)}
                  label="Format Waktu"
                  options={[
                    { value: '24h', label: '24 Jam (23:59)' },
                    { value: '12h', label: '12 Jam (11:59 PM)' }
                  ]}
                />
              </div>
            </PreferenceCard>

            {/* Theme & Appearance */}
            <PreferenceCard icon="🎨" title="Tema & Tampilan">
              <div className="space-y-4">
                <SelectInput
                  value={preferences.theme || 'system'}
                  onChange={(value) => handleDirectChange('theme', value)}
                  label="Mode Tema"
                  description="Pilih tema yang Anda sukai"
                  options={[
                    { value: 'light', label: '☀️ Terang' },
                    { value: 'dark', label: '🌙 Gelap' },
                    { value: 'system', label: '🔄 Ikuti Sistem' }
                  ]}
                />
                
                <ToggleSwitch
                  enabled={preferences.accessibility?.highContrast || false}
                  onChange={(value) => handlePreferenceChange('accessibility', 'highContrast', value)}
                  label="Kontras Tinggi"
                  description="Meningkatkan kontras untuk visibilitas yang lebih baik"
                />
                
                <ToggleSwitch
                  enabled={preferences.accessibility?.largeText || false}
                  onChange={(value) => handlePreferenceChange('accessibility', 'largeText', value)}
                  label="Teks Besar"
                  description="Memperbesar ukuran teks untuk kemudahan membaca"
                />
                
                <ToggleSwitch
                  enabled={preferences.accessibility?.animations !== false}
                  onChange={(value) => handlePreferenceChange('accessibility', 'animations', value)}
                  label="Animasi"
                  description="Aktifkan animasi dan transisi halus"
                />
              </div>
            </PreferenceCard>

            {/* Notifications */}
            <PreferenceCard icon="🔔" title="Notifikasi">
              <div className="space-y-4">
                <ToggleSwitch
                  enabled={preferences.notifications?.email !== false}
                  onChange={(value) => handlePreferenceChange('notifications', 'email', value)}
                  label="Email Notification"
                  description="Terima notifikasi melalui email"
                />
                
                <ToggleSwitch
                  enabled={preferences.notifications?.browser !== false}
                  onChange={(value) => handlePreferenceChange('notifications', 'browser', value)}
                  label="Browser Notification"
                  description="Tampilkan notifikasi di browser"
                />
                
                <ToggleSwitch
                  enabled={preferences.notifications?.sounds !== false}
                  onChange={(value) => handlePreferenceChange('notifications', 'sounds', value)}
                  label="Suara Notifikasi"
                  description="Putar suara saat ada notifikasi"
                />
                
                <ToggleSwitch
                  enabled={preferences.notifications?.dataAlerts !== false}
                  onChange={(value) => handlePreferenceChange('notifications', 'dataAlerts', value)}
                  label="Alert Data Sensor"
                  description="Notifikasi jika ada anomali data sensor"
                />
              </div>
            </PreferenceCard>

            {/* Dashboard Settings */}
            <PreferenceCard icon="📊" title="Pengaturan Dashboard">
              <div className="space-y-4">
                <SelectInput
                  value={String(preferences.dashboard?.refreshInterval || 30)}
                  onChange={(value) => {
                    const intValue = parseInt(value);
                    if (!isNaN(intValue)) {
                      handlePreferenceChange('dashboard', 'refreshInterval', intValue);
                    }
                  }}
                  label="Interval Refresh"
                  description="Seberapa sering data diperbarui"
                  options={[
                    { value: '10', label: '10 detik' },
                    { value: '30', label: '30 detik' },
                    { value: '60', label: '1 menit' },
                    { value: '300', label: '5 menit' }
                  ]}
                />
                
                <SelectInput
                  value={preferences.dashboard?.defaultTimeRange || '1h'}
                  onChange={(value) => handlePreferenceChange('dashboard', 'defaultTimeRange', value)}
                  label="Rentang Waktu Default"
                  description="Rentang waktu default untuk chart"
                  options={[
                    { value: '10m', label: '10 menit' },
                    { value: '1h', label: '1 jam' },
                    { value: '6h', label: '6 jam' },
                    { value: '1d', label: '1 hari' }
                  ]}
                />
                
                <ToggleSwitch
                  enabled={preferences.dashboard?.showGrid !== false}
                  onChange={(value) => handlePreferenceChange('dashboard', 'showGrid', value)}
                  label="Tampilkan Grid"
                  description="Tampilkan garis grid pada chart"
                />
                
                <ToggleSwitch
                  enabled={preferences.dashboard?.compactView || false}
                  onChange={(value) => handlePreferenceChange('dashboard', 'compactView', value)}
                  label="Tampilan Kompak"
                  description="Gunakan tampilan yang lebih ringkas"
                />
              </div>
            </PreferenceCard>

            {/* Units & Measurements */}
            <PreferenceCard icon="📏" title="Satuan & Pengukuran">
              <div className="space-y-4">
                <SelectInput
                  value={preferences.units?.temperature || 'celsius'}
                  onChange={(value) => handlePreferenceChange('units', 'temperature', value)}
                  label="Satuan Suhu"
                  description="Pilih satuan untuk menampilkan suhu"
                  options={[
                    { value: 'celsius', label: '°C (Celsius)' },
                    { value: 'fahrenheit', label: '°F (Fahrenheit)' },
                    { value: 'kelvin', label: 'K (Kelvin)' }
                  ]}
                />
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</span>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Info Satuan</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                        Perubahan satuan akan mempengaruhi semua tampilan data di aplikasi, 
                        termasuk chart dan export data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PreferenceCard>

            {/* Privacy & Security */}
            <PreferenceCard icon="🔒" title="Privasi & Keamanan">
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-600 dark:text-green-400 text-lg">🛡️</span>
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">Keamanan Data</h4>
                      <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                        Semua data Anda dienkripsi dan disimpan dengan aman. 
                        Kami tidak akan membagikan data pribadi Anda kepada pihak ketiga.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        🗑️ Hapus Semua Data
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">→</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Hapus semua data pribadi dan aktivitas Anda
                    </p>
                  </button>
                  
                  <button className="w-full text-left p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        📋 Export Data Pribadi
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">→</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Unduh salinan semua data pribadi Anda
                    </p>
                  </button>
                </div>
              </div>
            </PreferenceCard>
          </div>

          <FooterGlobal />
        </div>
      </div>
    </UserLayout>
  );
}
