<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityLogController extends Controller
{
    /**
     * Get activity logs for the authenticated user (API)
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Log::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc');
        // Filter by activity type if provided
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('activity', $request->type);
        }
        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('activity', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        // Pagination
        $perPage = $request->get('per_page', 50);
        $activities = $query->paginate($perPage);
        // Transform the data to match frontend expectations
        $transformedActivities = $activities->getCollection()->map(function ($log) {
            return [
                'id' => $log->id,
                'type' => $log->activity,
                'title' => $this->getActivityTitle($log->activity, $log->status),
                'description' => $log->description ?? $this->getDefaultDescription($log->activity),
                'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                'ip_address' => $log->ip_address ?? 'Unknown',
                'device' => $this->parseUserAgent($log->user_agent ?? ''),
                'status' => $log->status ?? 'success'
            ];
        });
        return response()->json([
            'data' => $transformedActivities,
            'current_page' => $activities->currentPage(),
            'last_page' => $activities->lastPage(),
            'per_page' => $activities->perPage(),
            'total' => $activities->total(),
        ]);
    }

    /**
     * Render activity log page for Inertia/React (Log.jsx) with lastLogin
     */
    public function showLogPage(Request $request)
    {
        $user = Auth::user();
        $query = Log::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc');
        // Filter by activity type if provided
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('activity', $request->type);
        }
        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('activity', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        // Pagination
        $perPage = $request->get('per_page', 50);
        $activities = $query->paginate($perPage);
        $transformedActivities = $activities->getCollection()->map(function ($log) {
            return [
                'id' => $log->id,
                'type' => $log->activity,
                'title' => $this->getActivityTitle($log->activity, $log->status),
                'description' => $log->description ?? $this->getDefaultDescription($log->activity),
                'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                'ip_address' => $log->ip_address ?? 'Unknown',
                'device' => $this->parseUserAgent($log->user_agent ?? ''),
                'status' => $log->status ?? 'success'
            ];
        });
        // Get lastLogin
        $lastLogin = Log::where('user_id', $user->id)
            ->where('activity', Log::ACTIVITY_LOGIN)
            ->where('status', Log::STATUS_SUCCESS)
            ->orderBy('created_at', 'desc')
            ->first();
        // Kirim ke Inertia
        return inertia('User/Log', [
            'logs' => $transformedActivities,
            'pagination' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
            ],
            'lastLogin' => $lastLogin ? $this->transformActivity($lastLogin) : null,
        ]);
    }
    
    /**
     * Get activity statistics for the authenticated user
     */
    public function stats()
    {
        $user = Auth::user();
        
        $totalActivities = Log::where('user_id', $user->id)->count();
        $loginCount = Log::where('user_id', $user->id)
                         ->where('activity', Log::ACTIVITY_LOGIN)
                         ->where('status', Log::STATUS_SUCCESS)
                         ->count();
        $exportCount = Log::where('user_id', $user->id)
                          ->where('activity', Log::ACTIVITY_EXPORT_DATA)
                          ->count();
        $failedLogins = Log::where('user_id', $user->id)
                           ->where('activity', Log::ACTIVITY_LOGIN)
                           ->where('status', Log::STATUS_FAILED)
                           ->count();
        
        // Get last activities
        $lastLogin = Log::where('user_id', $user->id)
                        ->where('activity', Log::ACTIVITY_LOGIN)
                        ->where('status', Log::STATUS_SUCCESS)
                        ->orderBy('created_at', 'desc')
                        ->first();
        
        $lastLogout = Log::where('user_id', $user->id)
                         ->where('activity', Log::ACTIVITY_LOGOUT)
                         ->orderBy('created_at', 'desc')
                         ->first();
        
        $lastPasswordChange = Log::where('user_id', $user->id)
                                 ->where('activity', Log::ACTIVITY_PASSWORD_CHANGE)
                                 ->orderBy('created_at', 'desc')
                                 ->first();
        
        $lastExport = Log::where('user_id', $user->id)
                         ->where('activity', Log::ACTIVITY_EXPORT_DATA)
                         ->orderBy('created_at', 'desc')
                         ->first();
        
        return response()->json([
            'totalActivities' => $totalActivities,
            'loginCount' => $loginCount,
            'exportCount' => $exportCount,
            'failedLogins' => $failedLogins,
            'lastActivities' => [
                'lastLogin' => $lastLogin ? $this->transformActivity($lastLogin) : null,
                'lastLogout' => $lastLogout ? $this->transformActivity($lastLogout) : null,
                'lastPasswordChange' => $lastPasswordChange ? $this->transformActivity($lastPasswordChange) : null,
                'lastExport' => $lastExport ? $this->transformActivity($lastExport) : null,
            ]
        ]);
    }
    
    /**
     * Transform a log entry to match frontend format
     */
    private function transformActivity($log)
    {
        return [
            'id' => $log->id,
            'type' => $log->activity,
            'title' => $this->getActivityTitle($log->activity, $log->status),
            'description' => $log->description ?? $this->getDefaultDescription($log->activity),
            'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
            'ip_address' => $log->ip_address ?? 'Unknown',
            'device' => $this->parseUserAgent($log->user_agent ?? ''),
            'status' => $log->status ?? 'success'
        ];
    }
    
    /**
     * Get activity title based on type and status
     */
    private function getActivityTitle($activity, $status)
    {
        $titles = [
            Log::ACTIVITY_LOGIN => $status === Log::STATUS_SUCCESS ? 'Login Berhasil' : 'Login Gagal',
            Log::ACTIVITY_LOGOUT => 'Logout',
            Log::ACTIVITY_PASSWORD_CHANGE => 'Password Diubah',
            Log::ACTIVITY_EXPORT_DATA => 'Export Data',
            Log::ACTIVITY_PROFILE_UPDATE => 'Profil Diperbarui',
        ];
        
        return $titles[$activity] ?? ucfirst(str_replace('_', ' ', $activity));
    }
    
    /**
     * Get default description for activity type
     */
    private function getDefaultDescription($activity)
    {
        $descriptions = [
            Log::ACTIVITY_LOGIN => 'Berhasil masuk ke sistem',
            Log::ACTIVITY_LOGOUT => 'Keluar dari sistem',
            Log::ACTIVITY_PASSWORD_CHANGE => 'Password akun berhasil diperbarui',
            Log::ACTIVITY_EXPORT_DATA => 'Export data sistem',
            Log::ACTIVITY_PROFILE_UPDATE => 'Informasi profil diperbarui',
        ];
        
        return $descriptions[$activity] ?? 'Aktivitas sistem';
    }
    
    /**
     * Parse user agent to get device info
     */
    private function parseUserAgent($userAgent)
    {
        if (empty($userAgent)) {
            return 'Unknown Device';
        }
        
        // Simple user agent parsing
        $browser = 'Unknown Browser';
        $os = 'Unknown OS';
        
        // Detect browser
        if (strpos($userAgent, 'Chrome') !== false) {
            $browser = 'Chrome';
        } elseif (strpos($userAgent, 'Firefox') !== false) {
            $browser = 'Firefox';
        } elseif (strpos($userAgent, 'Safari') !== false) {
            $browser = 'Safari';
        } elseif (strpos($userAgent, 'Edge') !== false) {
            $browser = 'Edge';
        }
        
        // Detect OS
        if (strpos($userAgent, 'Windows') !== false) {
            $os = 'Windows';
        } elseif (strpos($userAgent, 'Mac') !== false) {
            $os = 'macOS';
        } elseif (strpos($userAgent, 'Linux') !== false) {
            $os = 'Linux';
        } elseif (strpos($userAgent, 'Android') !== false) {
            $os = 'Android';
        } elseif (strpos($userAgent, 'iOS') !== false) {
            $os = 'iOS';
        }
        
        return "{$browser} on {$os}";
    }
}
