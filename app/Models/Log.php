<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;
    
    protected $table = 'logs';
    
    protected $fillable = [
        'user_id', 
        'activity', 
        'description', 
        'ip_address', 
        'user_agent', 
        'status',
        'created_at'
    ];
    
    public $timestamps = false;
    const UPDATED_AT = null;
    
    protected $casts = [
        'created_at' => 'datetime',
    ];
    
    // Relationship with User
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
    
    // Activity types constants
    const ACTIVITY_LOGIN = 'login';
    const ACTIVITY_LOGOUT = 'logout';
    const ACTIVITY_PASSWORD_CHANGE = 'password_change';
    const ACTIVITY_EXPORT_DATA = 'export_data';
    const ACTIVITY_PROFILE_UPDATE = 'profile_update';
    
    // Status constants
    const STATUS_SUCCESS = 'success';
    const STATUS_FAILED = 'failed';
    
    // Helper method to create activity log
    public static function createActivity($userId, $activity, $description = null, $status = self::STATUS_SUCCESS)
    {
        return self::create([
            'user_id' => $userId,
            'activity' => $activity,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status' => $status,
            'created_at' => now(),
        ]);
    }
}
