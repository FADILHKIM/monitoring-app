<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class SensorData extends Model
{
    use HasFactory;
    
    protected $table = 'sensor_data';
    
    protected $fillable = [
        'device_id', 'timestamp', 'current_in', 'current_out', 
        'voltage_in', 'voltage_out', 'temperature', 'lux', 'battery_percentage'
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'current_in' => 'decimal:3',
        'current_out' => 'decimal:3',
        'voltage_in' => 'decimal:3',
        'voltage_out' => 'decimal:3',
        'temperature' => 'decimal:2',
        'lux' => 'decimal:2',
        'battery_percentage' => 'decimal:2',
    ];

    public $timestamps = true;
    const UPDATED_AT = null; // Only use created_at

    /**
     * Scope untuk data dalam rentang waktu tertentu
     */
    public function scopeInTimeRange($query, $start, $end)
    {
        return $query->whereBetween('timestamp', [$start, $end]);
    }

    /**
     * Scope untuk device tertentu
     */
    public function scopeForDevice($query, $deviceId)
    {
        return $query->where('device_id', $deviceId);
    }

    /**
     * Scope untuk data terbaru
     */
    public function scopeRecent($query, $minutes = 10)
    {
        return $query->where('timestamp', '>=', Carbon::now()->subMinutes($minutes));
    }

    /**
     * Get latest reading
     */
    public static function getLatest($deviceId = 'NANO_001')
    {
        return self::where('device_id', $deviceId)
            ->orderBy('timestamp', 'desc')
            ->first();
    }

    /**
     * Get aggregated data for charts
     */
    public static function getAggregatedData($range = '1h', $deviceId = 'NANO_001')
    {
        $timeRange = self::parseTimeRange($range);
        
        return self::selectRaw('
                DATE_FORMAT(timestamp, "%Y-%m-%d %H:%i:00") as time_group,
                AVG(current_in) as current_in,
                AVG(current_out) as current_out,
                AVG(voltage_in) as voltage_in,
                AVG(voltage_out) as voltage_out,
                AVG(temperature) as temperature,
                AVG(lux) as lux,
                AVG(battery_percentage) as battery_percentage
            ')
            ->where('device_id', $deviceId)
            ->whereBetween('timestamp', [$timeRange['start'], $timeRange['end']])
            ->groupBy('time_group')
            ->orderBy('time_group', 'asc')
            ->get();
    }

    /**
     * Parse time range
     */
    private static function parseTimeRange($range)
    {
        $end = Carbon::now();
        
        switch ($range) {
            case '10m': $start = $end->copy()->subMinutes(10); break;
            case '1h': $start = $end->copy()->subHour(); break;
            case '6h': $start = $end->copy()->subHours(6); break;
            case '1d': $start = $end->copy()->subDay(); break;
            case '7d': $start = $end->copy()->subDays(7); break;
            case '30d': $start = $end->copy()->subDays(30); break;
            default: $start = $end->copy()->subHour();
        }
        
        return ['start' => $start, 'end' => $end];
    }
}