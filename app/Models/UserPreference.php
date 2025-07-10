<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'preferences',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'preferences' => 'array',
    ];

    /**
     * Get the user that owns the preferences.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get default preferences structure.
     */
    public static function getDefaultPreferences(): array
    {
        return [
            'language' => 'id',
            'theme' => 'system',
            'units' => [
                'temperature' => 'celsius',
                'dateFormat' => 'DD/MM/YYYY',
                'timeFormat' => '24h',
            ],
            'notifications' => [
                'email' => true,
                'browser' => true,
                'sounds' => true,
                'dataAlerts' => true,
            ],
            'dashboard' => [
                'refreshInterval' => 30,
                'defaultTimeRange' => '1h',
                'showGrid' => true,
                'compactView' => false,
            ],
            'accessibility' => [
                'highContrast' => false,
                'largeText' => false,
                'animations' => true,
            ],
        ];
    }

    /**
     * Get preference value by key (supports dot notation).
     */
    public function getPreference(string $key, $default = null)
    {
        return data_get($this->preferences, $key, $default);
    }

    /**
     * Set preference value by key (supports dot notation).
     */
    public function setPreference(string $key, $value): void
    {
        $preferences = $this->preferences;
        data_set($preferences, $key, $value);
        $this->preferences = $preferences;
    }

    /**
     * Merge preferences with new values.
     */
    public function mergePreferences(array $newPreferences): void
    {
        $this->preferences = array_merge_recursive($this->preferences, $newPreferences);
    }

    /**
     * Reset preferences to default.
     */
    public function resetToDefault(): void
    {
        $this->preferences = self::getDefaultPreferences();
    }
}