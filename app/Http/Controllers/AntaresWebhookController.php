<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\SensorDataCacheService;
use Carbon\Carbon;

class AntaresWebhookController extends Controller
{
    protected $cacheService;
    
    public function __construct(SensorDataCacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Handle webhook from Antares platform
     */
    public function handleWebhook(Request $request)
    {
        try {
            Log::info('Antares webhook received:', $request->all());
            
            // Parse Antares webhook format
            $webhookData = $request->all();
            
            // Extract sensor data from Antares format
            $sensorData = $this->parseAntaresData($webhookData);
            
            if ($sensorData) {
                // Store to database
                $this->storeSensorData($sensorData);
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Webhook processed successfully'
                ], 200);
            }
            
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid webhook data format'
            ], 400);
            
        } catch (\Exception $e) {
            Log::error('Antares webhook error: ' . $e->getMessage());
            Log::error('Request data: ' . json_encode($request->all()));
            
            return response()->json([
                'status' => 'error',
                'message' => 'Webhook processing failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Parse data from Antares webhook format
     */
    private function parseAntaresData($webhookData)
    {
        try {
            // Antares webhook bisa dalam berbagai format, adjust sesuai kebutuhan
            
            // Format 1: Direct sensor data
            if (isset($webhookData['sensors'])) {
                return $webhookData;
            }
            
            // Format 2: Antares m2m format
            if (isset($webhookData['m2m:sgn']['m2m:nev']['m2m:rep']['m2m:cin']['con'])) {
                $content = $webhookData['m2m:sgn']['m2m:nev']['m2m:rep']['m2m:cin']['con'];
                
                // Jika content adalah JSON string
                if (is_string($content)) {
                    return json_decode($content, true);
                }
                
                return $content;
            }
            
            // Format 3: Simple content format
            if (isset($webhookData['content'])) {
                if (is_string($webhookData['content'])) {
                    return json_decode($webhookData['content'], true);
                }
                return $webhookData['content'];
            }
            
            // Format 4: Raw data
            if (isset($webhookData['device_id']) && isset($webhookData['sensors'])) {
                return $webhookData;
            }
            
            return null;
            
        } catch (\Exception $e) {
            Log::error('Error parsing Antares data: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Store sensor data to database
     */
    private function storeSensorData($data)
    {
        // Validate required fields
        if (!isset($data['sensors'])) {
            throw new \Exception('Missing sensors data');
        }
        
        $sensors = $data['sensors'];
        $deviceId = $data['device_id'] ?? 'NANO_001';
        $timestamp = isset($data['timestamp']) ? 
            Carbon::parse($data['timestamp']) : 
            Carbon::now();
        
        // Insert to database
        DB::table('sensor_data')->insert([
            'device_id' => $deviceId,
            'timestamp' => $timestamp,
            'current_in' => $sensors['current_in'] ?? 0,
            'current_out' => $sensors['current_out'] ?? 0,
            'voltage_in' => $sensors['voltage_in'] ?? 0,
            'voltage_out' => $sensors['voltage_out'] ?? 0,
            'temperature' => $sensors['temperature'] ?? 0,
            'lux' => $sensors['lux'] ?? 0,
            'battery_percentage' => $sensors['battery_percentage'] ?? 0,
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        // Clear cache setelah ada data baru
        $this->cacheService->clearCache('latest_sensor_data');
        $this->cacheService->clearCache('system_status');
        
        Log::info('Sensor data stored successfully', [
            'device_id' => $deviceId,
            'timestamp' => $timestamp,
            'sensors' => $sensors
        ]);
    }
    
    /**
     * Test endpoint untuk simulasi webhook
     */
    public function test(Request $request)
    {
        // Generate sample data
        $testData = [
            'device_id' => 'NANO_001',
            'sensors' => [
                'current_in' => round(rand(100, 500) / 100, 3),
                'current_out' => round(rand(100, 480) / 100, 3),
                'voltage_in' => round(rand(21000, 24000) / 100, 1),
                'voltage_out' => round(rand(20800, 23800) / 100, 1),
                'temperature' => round(rand(2000, 3500) / 100, 2),
                'lux' => round(rand(0, 100000) / 100, 2),
                'battery_percentage' => round(rand(2000, 10000) / 100, 2)
            ],
            'timestamp' => Carbon::now()->format('Y-m-d H:i:s')
        ];
        
        $this->storeSensorData($testData);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Test data stored successfully',
            'data' => $testData
        ]);
    }
}
