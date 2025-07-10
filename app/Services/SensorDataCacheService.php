<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Models\SensorData;
use Carbon\Carbon;

class SensorDataCacheService
{
    const CACHE_TTL = 300; // 5 minutes
    const REALTIME_CACHE_TTL = 30; // 30 seconds
    
    /**
     * Get latest sensor data with caching
     */
    public function getLatestSensorData()
    {
        return Cache::remember('sensor_data_latest', self::REALTIME_CACHE_TTL, function () {
            return SensorData::orderBy('timestamp', 'desc')->first();
        });
    }
    
    /**
     * Get sensor data for date range with caching
     */
    public function getSensorDataForDateRange($startDate = null, $endDate = null)
    {
        $cacheKey = 'sensor_data_range_' . md5($startDate . $endDate);
        
        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($startDate, $endDate) {
            $query = SensorData::orderBy('timestamp', 'desc');
            
            if ($startDate) {
                $query->where('timestamp', '>=', $startDate);
            }
            
            if ($endDate) {
                $query->where('timestamp', '<=', $endDate . ' 23:59:59');
            }
            
            return $query->limit(1000)->get(); // Limit untuk performance
        });
    }
    
    /**
     * Get aggregated sensor data for charts
     */
    public function getAggregatedSensorData($hours = 24)
    {
        $cacheKey = "sensor_data_aggregated_{$hours}h";
        
        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($hours) {
            $startTime = Carbon::now()->subHours($hours);
            
            return DB::table('sensor_data')
                ->select(
                    DB::raw('DATE_FORMAT(timestamp, "%Y-%m-%d %H:00:00") as hour'),
                    DB::raw('AVG(current_in) as avg_current_in'),
                    DB::raw('AVG(current_out) as avg_current_out'),
                    DB::raw('AVG(voltage_in) as avg_voltage_in'),
                    DB::raw('AVG(voltage_out) as avg_voltage_out'),
                    DB::raw('AVG(temperature) as avg_temperature'),
                    DB::raw('AVG(lux) as avg_lux'),
                    DB::raw('AVG(battery_percentage) as avg_battery'),
                    DB::raw('COUNT(*) as data_points')
                )
                ->where('timestamp', '>=', $startTime)
                ->groupBy('hour')
                ->orderBy('hour', 'asc')
                ->get();
        });
    }
    
    /**
     * Get system performance metrics
     */
    public function getPerformanceMetrics()
    {
        return Cache::remember('performance_metrics', 60, function () {
            $oneHourAgo = Carbon::now()->subHour();
            $oneDayAgo = Carbon::now()->subDay();
            
            return [
                'data_points_last_hour' => SensorData::where('timestamp', '>=', $oneHourAgo)->count(),
                'data_points_last_day' => SensorData::where('timestamp', '>=', $oneDayAgo)->count(),
                'total_data_points' => SensorData::count(),
                'latest_reading_time' => SensorData::max('timestamp'),
                'database_size_mb' => $this->getDatabaseSize(),
            ];
        });
    }
    
    /**
     * Clear specific cache keys
     */
    public function clearCache($pattern = null)
    {
        if ($pattern) {
            // Clear specific pattern (for Redis/Memcached)
            Cache::flush(); // Fallback for database cache
        } else {
            // Clear all sensor data cache
            Cache::forget('sensor_data_latest');
            Cache::forget('performance_metrics');
            
            // Clear aggregated cache
            foreach ([1, 6, 12, 24, 48] as $hours) {
                Cache::forget("sensor_data_aggregated_{$hours}h");
            }
        }
    }
    
    /**
     * Warm up cache with commonly accessed data
     */
    public function warmUpCache()
    {
        // Preload latest data
        $this->getLatestSensorData();
        
        // Preload common time ranges
        $this->getAggregatedSensorData(24); // Last 24 hours
        $this->getAggregatedSensorData(48); // Last 48 hours
        
        // Preload performance metrics
        $this->getPerformanceMetrics();
    }
    
    /**
     * Get database size in MB
     */
    private function getDatabaseSize()
    {
        try {
            $result = DB::select("
                SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
            ");
            
            return $result[0]->size_mb ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }
    
    /**
     * Cache invalidation on new data
     */
    public function invalidateOnNewData()
    {
        Cache::forget('sensor_data_latest');
        Cache::forget('performance_metrics');
        
        // Clear today's aggregated data
        $hours = Carbon::now()->hour + 1;
        Cache::forget("sensor_data_aggregated_{$hours}h");
    }
    
    /**
     * Cache latest sensor data
     */
    public function cacheLatestSensorData($data)
    {
        Cache::put('latest_sensor_data', $data, self::REALTIME_CACHE_TTL);
    }
    
    /**
     * Get cached data by key
     */
    public function getCachedData($key)
    {
        return Cache::get($key);
    }
    
    /**
     * Cache data with custom TTL
     */
    public function cacheData($key, $data, $ttlMinutes = null)
    {
        $ttl = $ttlMinutes ? $ttlMinutes * 60 : self::CACHE_TTL;
        Cache::put($key, $data, $ttl);
    }
}
