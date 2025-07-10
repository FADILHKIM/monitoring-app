// resources/js/Utils/constants.js

// Sensor configurations for the monitoring system
export const SENSOR_CONFIGS = {
  current_in: {
    label: 'Arus Masuk',
    unit: 'A',
    icon: '⚡',
    color: '#3b82f6',
    sensor_type: 'current_in'
  },
  current_out: {
    label: 'Arus Keluar',
    unit: 'A', 
    icon: '⚡',
    color: '#10b981',
    sensor_type: 'current_out'
  },
  voltage_in: {
    label: 'Tegangan Masuk',
    unit: 'V',
    icon: '🔌',
    color: '#f59e0b',
    sensor_type: 'voltage_in'
  },
  voltage_out: {
    label: 'Tegangan Keluar',
    unit: 'V',
    icon: '🔌', 
    color: '#ef4444',
    sensor_type: 'voltage_out'
  },
  temperature: {
    label: 'Suhu',
    unit: '°C',
    icon: '🌡️',
    color: '#8b5cf6',
    sensor_type: 'temperature'
  },
  // lux sensor removed
  battery_percentage: {
    label: 'Baterai',
    unit: '%',
    icon: '🔋',
    color: '#06b6d4',
    sensor_type: 'battery_percentage'
  }
};

export const RANGES = {
  '10m': { label: '10 menit' },
  '1h':  { label: '1 jam' },
  '12h': { label: '12 jam' },
  '24h': { label: '24 jam' },
  '1w':  { label: '1 minggu' },
  '1M':  { label: '1 bulan' },
  'all': { label: 'Semua' },
};