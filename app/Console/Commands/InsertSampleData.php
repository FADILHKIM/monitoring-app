<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InsertSampleData extends Command
{
    protected $signature = 'data:sample';
    protected $description = 'Insert sample sensor data for testing';

    public function handle()
    {
        $this->info('Inserting sample sensor data...');
        
        // Check if data already exists
        $count = DB::table('sensor_data')->count();
        if ($count > 0) {
            $this->warn("Database already has {$count} records.");
            if (!$this->confirm('Do you want to add more sample data?')) {
                return 0;
            }
        }
        
        $now = Carbon::now();
        $sampleData = [];
        
        // Generate data for last 2 hours
        for ($i = 0; $i < 120; $i++) {
            $timestamp = $now->copy()->subMinutes($i);
            
            $sampleData[] = [
                'timestamp' => $timestamp,
                'current_in' => round(2.0 + sin($i * 0.1) * 0.3 + (rand(-50, 50) / 1000), 3),
                'current_out' => round(1.8 + cos($i * 0.15) * 0.2 + (rand(-40, 40) / 1000), 3),
                'voltage_in' => round(12.0 + sin($i * 0.05) * 0.5 + (rand(-100, 100) / 1000), 2),
                'voltage_out' => round(11.5 + cos($i * 0.08) * 0.4 + (rand(-80, 80) / 1000), 2),
                'temperature' => round(25 + sin($i * 0.04) * 3 + (rand(-100, 100) / 100), 1),
                'lux' => round(max(0, 450 + sin($i * 0.06) * 200 + rand(-50, 50)), 0),
                'battery_percentage' => round(max(20, min(100, 85 + sin($i * 0.02) * 10 + (rand(-30, 30) / 10))), 1),
                'created_at' => $timestamp,
                'updated_at' => $timestamp
            ];
        }
        
        // Insert in chunks
        $chunks = array_chunk($sampleData, 50);
        $totalInserted = 0;
        
        foreach ($chunks as $chunk) {
            DB::table('sensor_data')->insert($chunk);
            $totalInserted += count($chunk);
            $this->info("Inserted {$totalInserted} records...");
        }
        
        $this->info("Successfully inserted {$totalInserted} sample records!");
        $this->info("You can now test the /api/sensor-data/historical endpoint");
        
        return 0;
    }
}