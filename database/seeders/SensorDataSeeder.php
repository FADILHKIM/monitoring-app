<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SensorDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insert sample sensor data for last 3 months, interval 20 minutes
        $now = Carbon::now();
        $start = $now->copy()->subMonths(3);
        $intervalMinutes = 20;
        $totalPoints = $start->diffInMinutes($now) / $intervalMinutes;

        for ($i = 0; $i <= $totalPoints; $i++) {
            $timestamp = $start->copy()->addMinutes($i * $intervalMinutes);
            DB::table('sensor_data')->insert([
                'device_id' => 'NANO_001',
                'timestamp' => $timestamp,
                'current_in' => round(2.0 + (rand(-50, 50) / 100), 3),
                'current_out' => round(1.8 + (rand(-50, 50) / 100), 3),
                'voltage_in' => round(12.5 + (rand(-20, 20) / 100), 3),
                'voltage_out' => round(12.2 + (rand(-20, 20) / 100), 3),
                'temperature' => round(25 + (rand(-50, 50) / 10), 2),
                'battery_percentage' => round(80 + (rand(-20, 20)), 2),
                'created_at' => $timestamp
            ]);
        }
        
        ;
    }
}