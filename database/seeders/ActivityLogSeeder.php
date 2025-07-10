<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Log;
use App\Models\User;
use Carbon\Carbon;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user for demo purposes
        $user = User::first();
        
        if (!$user) {
            $this->command->info('No users found. Please create a user first.');
            return;
        }
        
        // Sample activity logs
        $activities = [
            [
                'activity' => Log::ACTIVITY_LOGIN,
                'description' => 'Berhasil masuk ke sistem',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'status' => Log::STATUS_SUCCESS,
                'created_at' => Carbon::now()->subDays(2)->subHours(2),
            ],
            [
                'activity' => Log::ACTIVITY_PASSWORD_CHANGE,
                'description' => 'Password akun berhasil diperbarui',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'status' => Log::STATUS_SUCCESS,
                'created_at' => Carbon::now()->subDays(1)->subHours(6),
            ],
            [
                'activity' => Log::ACTIVITY_EXPORT_DATA,
                'description' => 'Export data sensor dalam format CSV periode 2024-12-25 - 2025-01-01',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'status' => Log::STATUS_SUCCESS,
                'created_at' => Carbon::now()->subDays(1)->subHours(3),
            ],
            [
                'activity' => Log::ACTIVITY_LOGOUT,
                'description' => 'Keluar dari sistem',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'status' => Log::STATUS_SUCCESS,
                'created_at' => Carbon::now()->subDays(1)->subHours(1),
            ],
            [
                'activity' => Log::ACTIVITY_LOGIN,
                'description' => 'Percobaan login dengan password yang salah',
                'ip_address' => '192.168.1.105',
                'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'status' => Log::STATUS_FAILED,
                'created_at' => Carbon::now()->subHours(8),
            ],
            [
                'activity' => Log::ACTIVITY_LOGIN,
                'description' => 'Berhasil masuk ke sistem',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'status' => Log::STATUS_SUCCESS,
                'created_at' => Carbon::now()->subHours(4),
            ],
            [
                'activity' => Log::ACTIVITY_EXPORT_DATA,
                'description' => 'Export data sensor dalam format PDF periode 2024-12-30 - 2025-01-02',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'status' => Log::STATUS_SUCCESS,
                'created_at' => Carbon::now()->subHours(2),
            ],
        ];
        
        foreach ($activities as $activity) {
            Log::create([
                'user_id' => $user->id,
                'activity' => $activity['activity'],
                'description' => $activity['description'],
                'ip_address' => $activity['ip_address'],
                'user_agent' => $activity['user_agent'],
                'status' => $activity['status'],
                'created_at' => $activity['created_at'],
            ]);
        }
        
        $this->command->info('Sample activity logs created successfully!');
    }
}
