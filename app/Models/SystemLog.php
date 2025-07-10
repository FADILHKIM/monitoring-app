<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_type',
        'event_message',
        'event_data',
        'severity',
        'created_at'
    ];

    protected $casts = [
        'event_data' => 'array',
        'created_at' => 'datetime'
    ];

    // Severity levels
    const SEVERITY_INFO = 'info';
    const SEVERITY_WARNING = 'warning';
    const SEVERITY_ERROR = 'error';
    const SEVERITY_SUCCESS = 'success';

    // Event types
    const TYPE_SYSTEM = 'system';
    const TYPE_SENSOR = 'sensor';
    const TYPE_API = 'api';
    const TYPE_DATABASE = 'database';
    const TYPE_NETWORK = 'network';

    /**
     * Log a system event
     */
    public static function logEvent($type, $message, $data = null, $severity = self::SEVERITY_INFO)
    {
        return self::create([
            'event_type' => $type,
            'event_message' => $message,
            'event_data' => $data,
            'severity' => $severity
        ]);
    }

    /**
     * Get recent events
     */
    public static function getRecent($limit = 10)
    {
        return self::orderBy('created_at', 'desc')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Get events by type
     */
    public static function getByType($type, $limit = 10)
    {
        return self::where('event_type', $type)
                   ->orderBy('created_at', 'desc')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Get events by severity
     */
    public static function getBySeverity($severity, $limit = 10)
    {
        return self::where('severity', $severity)
                   ->orderBy('created_at', 'desc')
                   ->limit($limit)
                   ->get();
    }
}
