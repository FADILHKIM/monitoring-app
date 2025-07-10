<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateSensorDataTable extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sensor:create-table';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create sensor_data table manually';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            // Drop and recreate sensor_data table
            $this->info('Creating sensor_data table...');
            
            DB::statement('DROP TABLE IF EXISTS sensor_data');
            
            DB::statement('
                CREATE TABLE sensor_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    device_id TEXT DEFAULT "NANO_001",
                    timestamp DATETIME NOT NULL,
                    current_in DECIMAL(8,3),
                    current_out DECIMAL(8,3),
                    voltage_in DECIMAL(8,3),
                    voltage_out DECIMAL(8,3),
                    temperature DECIMAL(5,2),
                    lux DECIMAL(8,2),
                    battery_percentage DECIMAL(5,2),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ');
            
            // Create indexes
            DB::statement('CREATE INDEX idx_sensor_device_timestamp ON sensor_data(device_id, timestamp)');
            DB::statement('CREATE INDEX idx_sensor_timestamp ON sensor_data(timestamp)');
            
            $this->info('✅ sensor_data table created successfully!');
            
            // Insert sample data
            $this->info('Inserting sample data...');
            
            $sampleData = [];
            for ($i = 0; $i < 10; $i++) {
                $timestamp = date('Y-m-d H:i:s', strtotime("-{$i} hours"));
                $sampleData[] = [
                    'device_id' => 'NANO_001',
                    'timestamp' => $timestamp,
                    'current_in' => round(rand(100, 500) / 100, 2),
                    'current_out' => round(rand(80, 450) / 100, 2),
                    'voltage_in' => round(rand(1100, 1300) / 100, 2),
                    'voltage_out' => round(rand(1000, 1200) / 100, 2),
                    'temperature' => round(rand(2500, 3500) / 100, 2),
                    'lux' => round(rand(500, 1500), 2),
                    'battery_percentage' => round(rand(70, 100), 2),
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ];
            }
            
            DB::table('sensor_data')->insert($sampleData);
            
            $count = DB::table('sensor_data')->count();
            $this->info("✅ Inserted {$count} sample records");
            
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
