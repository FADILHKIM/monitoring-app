<?php
// File ini tidak digunakan lagi karena aplikasi sudah tidak menggunakan MySQL/XAMPP.

// app/Models/User.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's preferences.
     */
    public function preference()
    {
        return $this->hasOne(UserPreference::class);
    }

    /**
     * Get user preferences with defaults.
     */
    public function getPreferences(): array
    {
        return $this->preference ? $this->preference->preferences : UserPreference::getDefaultPreferences();
    }

    /**
     * Get a specific preference value.
     */
    public function getPreference(string $key, $default = null)
    {
        $preferences = $this->getPreferences();
        return data_get($preferences, $key, $default);
    }
}