<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceStatus extends Model
{
    use HasFactory;
    protected $table = 'device_status';
    protected $fillable = [
        'device', 'device_id', 'status', 'updated_at', 'last_seen'
    ];
    public $timestamps = false;
    const CREATED_AT = null;
    const UPDATED_AT = 'updated_at';

    /**
     * Get latest sensor data for this device
     */
    public function latestSensorData()
    {
        return $this->hasOne(SensorData::class, 'device_id', 'device_id')
            ->latest('timestamp');
    }

    /**
     * Check if device is online (data within last 5 minutes)
     */
    public function isOnline()
    {
        return $this->last_seen && 
               $this->last_seen->diffInMinutes(now()) <= 5;
    }
}
