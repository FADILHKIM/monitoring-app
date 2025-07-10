<?php

use App\Http\Controllers\SensorDataController;
use App\Http\Controllers\AntaresController;
use App\Http\Controllers\User\PreferenceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SystemStatusController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Auth/Login');
    })->name('login');
    
    Route::get('/register', function () {
        return Inertia::render('Auth/Register');
    })->name('register');
});

// Authentication actions
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
Route::post('/register', [AuthController::class, 'register'])->name('auth.register');

// Logout route (requires auth)
Route::post('/logout', function () {
    $user = auth()->user();
    
    // Log the logout activity before logging out
    if ($user) {
        \App\Models\Log::createActivity(
            $user->id,
            \App\Models\Log::ACTIVITY_LOGOUT,
            'Keluar dari sistem'
        );
    }
    
    auth()->logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/');
})->middleware('auth')->name('logout');

// Authentication required routes
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('User/Dashboard');
    })->name('dashboard');

    // Ganti route log agar menggunakan controller dan mengirimkan lastLogin
    Route::get('/log', [\App\Http\Controllers\ActivityLogController::class, 'showLogPage'])->name('log');

    Route::get('/grafik', function () {
        return Inertia::render('User/Grafik');
    })->name('grafik');

    Route::get('/info', function () {
        return Inertia::render('User/Info');
    })->name('info');

    Route::get('/preferensi', [PreferenceController::class, 'index'])->name('preferensi');

    Route::get('/status', function () {
        return Inertia::render('User/Status');
    })->name('status');

    Route::get('/riwayat-aktivitas', function () {
        return Inertia::render('User/RiwayatAktivitas');
    })->name('riwayat-aktivitas');

    Route::get('/settings', function () {
        return Inertia::render('User/Settings');
    })->name('settings');

    Route::get('/lokasi', function () {
        return Inertia::render('User/Lokasi');
    })->name('lokasi');
    
    // User settings routes
    Route::post('/user/settings/password', [UserController::class, 'updatePassword'])->name('user.settings.password');
    Route::post('/user/settings/profile', [UserController::class, 'updateProfile'])->name('user.settings.profile');
});

// Clean API Routes (no auth for development)
Route::prefix('api')->group(function () {
    // Antares real-time data endpoints
    Route::get('/antares/realtime', [AntaresController::class, 'getRealtime']);
    // Antares fetch and store to database
    Route::post('/antares/fetch-store', [AntaresController::class, 'fetchAndStore']);
    
    // Antares data by sensor type
    Route::get('/antares-data/{sensorType}', [AntaresController::class, 'getSensorDataByType']);
    
    // Database sensor data endpoints  
    Route::get('/sensor-data/realtime', [SensorDataController::class, 'realtime']);
    Route::get('/sensor-data/historical', [SensorDataController::class, 'historical']);
    Route::get('/sensor-data/log', [SensorDataController::class, 'getLogData']);
    Route::get('/sensor-data/export/csv', [SensorDataController::class, 'exportLogCsv']);
    Route::get('/sensor-data/export/pdf', [SensorDataController::class, 'exportLogPdf']);
    Route::post('/sensor-data/store', [SensorDataController::class, 'storeSensorData']);
    
    // Sensor data by type
    Route::get('/sensor-data/{sensorType}', [SensorDataController::class, 'getSensorDataByType']);
    
    // System status API endpoint (optimized dengan caching)
    Route::get('/system/status', [SensorDataController::class, 'systemStatus']);
    Route::get('/api/system/status', [SensorDataController::class, 'systemStatus']); // For Status.jsx
    
    // Alias routes for backward compatibility
    Route::get('/historical', [SensorDataController::class, 'historical']); // For SensorChart.jsx
    Route::get('/realtime', [SensorDataController::class, 'realtime']); // For SensorChart.jsx
    
    // User preferences API endpoints (auth required)
    Route::middleware('auth')->group(function () {
        Route::post('/preferences', [PreferenceController::class, 'update']);
        Route::post('/preferences/update', [PreferenceController::class, 'updatePreference']);
        Route::post('/preferences/reset', [PreferenceController::class, 'reset']);
        Route::get('/preferences', [PreferenceController::class, 'getPreferences']);
        
        // Activity logs API endpoints
        Route::get('/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index']);
        Route::get('/activity-logs/stats', [\App\Http\Controllers\ActivityLogController::class, 'stats']);
    });
    
    // System status API route
    Route::get('/system-status', [SystemStatusController::class, 'index']);
});
