<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AntaresController extends Controller
{
    private $antaresBaseUrl;
    // Duplicate property declarations and constructor removed after accidental code duplication.

    /**
     * Fetch data from Antares and store to database
     */
    public function fetchAndStore()
    {
        try {
            $url = "{$this->antaresBaseUrl}/~/antares-cse/antares-id/{$this->applicationName}/{$this->deviceName}/la";
            \Log::info('[fetchAndStore] Fetching data from Antares URL: ' . $url);
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'X-M2M-Origin' => $this->accessKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->timeout(10)->get($url);

            if (!$response->successful()) {
                \Log::error('[fetchAndStore] Antares API error: ' . $response->body());
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to connect to Antares API',
                    'error' => 'HTTP ' . $response->status()
                ], 500);
            }

            $data = $response->json();
            \Log::info('[fetchAndStore] Full Antares response data: ' . json_encode($data));

            if (!isset($data['m2m:cin'])) {
                \Log::warning('[fetchAndStore] No m2m:cin found in response');
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid Antares response format',
                    'error' => 'No m2m:cin structure found'
                ], 500);
            }
            if (!isset($data['m2m:cin']['con'])) {
                \Log::warning('[fetchAndStore] No con field found in m2m:cin');
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid Antares data structure',
                    'error' => 'No sensor data found in response'
                ], 500);
            }

            $sensorDataRaw = $data['m2m:cin']['con'];
            \Log::info('[fetchAndStore] Raw sensor data: ' . json_encode($sensorDataRaw));
            if (is_string($sensorDataRaw)) {
                $sensorData = json_decode($sensorDataRaw, true);
                \Log::info('[fetchAndStore] Decoded JSON sensor data: ' . json_encode($sensorData));
                \Log::info('[fetchAndStore] JSON decode error: ' . json_last_error_msg());
            } else {
                $sensorData = $sensorDataRaw;
                \Log::info('[fetchAndStore] Direct sensor data: ' . json_encode($sensorData));
            }

            if (!is_array($sensorData)) {
                \Log::warning('[fetchAndStore] Sensor data is not an array: ' . json_encode($sensorData));
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid sensor data format',
                    'error' => 'Sensor data is not in expected format'
                ], 500);
            }

            $sensorFields = ['current_in', 'current_out', 'voltage_in', 'voltage_out', 'temperature', 'battery_percentage'];
            $finalSensorData = isset($sensorData['sensors']) && is_array($sensorData['sensors']) ? $sensorData['sensors'] : $sensorData;
            $hasValidSensorData = false;
            foreach ($sensorFields as $field) {
                if (isset($finalSensorData[$field]) && is_numeric($finalSensorData[$field])) {
                    $hasValidSensorData = true;
                    break;
                }
            }
            if (!$hasValidSensorData) {
                \Log::warning('[fetchAndStore] No valid sensor data found in: ' . json_encode($finalSensorData));
                return response()->json([
                    'status' => 'error',
                    'message' => 'No valid sensor data found',
                    'error' => 'Response contains no numeric sensor fields'
                ], 500);
            }

            $antaresTimestamp = $data['m2m:cin']['ct'] ?? null;
            $timestamp = $this->parseAntaresTimestamp($antaresTimestamp);

            // Insert to database (table: sensor_data)
            \DB::table('sensor_data')->insert([
                'timestamp' => $timestamp,
                'current_in' => (float) ($finalSensorData['current_in'] ?? 0),
                'current_out' => (float) ($finalSensorData['current_out'] ?? 0),
                'voltage_in' => (float) ($finalSensorData['voltage_in'] ?? 0),
                'voltage_out' => (float) ($finalSensorData['voltage_out'] ?? 0),
                'temperature' => (float) ($finalSensorData['temperature'] ?? 0),
                'battery_percentage' => (float) ($finalSensorData['battery_percentage'] ?? 0),
                'created_at' => now(),
            ]);

            \Log::info('[fetchAndStore] Data from Antares stored to database. Timestamp: ' . $timestamp);

            return response()->json([
                'status' => 'success',
                'message' => 'Data from Antares stored to database',
                'data' => $finalSensorData,
                'timestamp' => $timestamp
            ]);
        } catch (\Exception $e) {
            \Log::error('[fetchAndStore] Exception: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch/store data from Antares',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private $accessKey;
    private $applicationName;
    private $deviceName;
    
    public function __construct()
    {
        $this->antaresBaseUrl = env('ANTARES_BASE_URL', 'https://platform.antares.id:8443');
        $this->accessKey = env('ANTARES_API_KEY');
        $this->applicationName = env('ANTARES_APP_NAME', 'cosmic');
        $this->deviceName = env('DEVICE_NAME', 'monitor');
        
        Log::info('AntaresController initialized - URL: ' . $this->antaresBaseUrl);
    }
      /**
     * Get realtime data from Antares
     */
    public function getRealtime()
    {
        try {
            $url = "{$this->antaresBaseUrl}/~/antares-cse/antares-id/{$this->applicationName}/{$this->deviceName}/la";
            
            Log::info('Fetching data from Antares URL: ' . $url);
            
            $response = Http::withHeaders([
                'X-M2M-Origin' => $this->accessKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->timeout(10)->get($url);
            
            Log::info('Antares response status: ' . $response->status());
            Log::info('Antares response body: ' . $response->body());
            
            if (!$response->successful()) {
                Log::error('Antares API error: ' . $response->body());
                Log::error('Response status: ' . $response->status());
                Log::error('Response headers: ' . json_encode($response->headers()));
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to connect to Antares API',
                    'error' => 'HTTP ' . $response->status()
                ], 500)->header('Content-Type', 'application/json');
            }
            
            $data = $response->json();
            Log::info('Full Antares response data: ' . json_encode($data));
            
            // First check if we have the m2m:cin structure
            if (!isset($data['m2m:cin'])) {
                Log::warning('No m2m:cin found in response');
                Log::warning('Available keys: ' . implode(', ', array_keys($data)));
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid Antares response format',
                    'error' => 'No m2m:cin structure found'
                ], 500)->header('Content-Type', 'application/json');
            }
            
            // Check if we have the con field
            if (!isset($data['m2m:cin']['con'])) {
                Log::warning('No con field found in m2m:cin');
                Log::warning('m2m:cin structure: ' . json_encode($data['m2m:cin']));
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid Antares data structure',
                    'error' => 'No sensor data found in response'
                ], 500)->header('Content-Type', 'application/json');
            }

            // Parse Antares response - handle the actual structure from your screenshot
            $sensorDataRaw = $data['m2m:cin']['con'];
            
            Log::info('Raw sensor data from Antares: ' . json_encode($sensorDataRaw));
            Log::info('Data type: ' . gettype($sensorDataRaw));
            
            // The data from Antares appears to be a direct object with sensor values
            if (is_string($sensorDataRaw)) {
                $sensorData = json_decode($sensorDataRaw, true);
                Log::info('Decoded JSON sensor data: ' . json_encode($sensorData));
                Log::info('JSON decode error: ' . json_last_error_msg());
            } else {
                $sensorData = $sensorDataRaw;
                Log::info('Direct sensor data: ' . json_encode($sensorData));
            }
            
            Log::info('Final sensor data type: ' . gettype($sensorData));
            Log::info('Final sensor data: ' . json_encode($sensorData));
            
            // Check if we have any sensor data at all
            if (!is_array($sensorData)) {
                Log::warning('Sensor data is not an array: ' . json_encode($sensorData));
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid sensor data format',
                    'error' => 'Sensor data is not in expected format'
                ], 500)->header('Content-Type', 'application/json');
            }
            
            // More flexible validation - check if we have ANY numeric sensor field
            $hasValidSensorData = false;
            $sensorFields = ['current_in', 'current_out', 'voltage_in', 'voltage_out', 'temperature', 'battery_percentage'];
            
            // Check if sensors are in nested structure
            $sensorsData = $sensorData;
            if (isset($sensorData['sensors']) && is_array($sensorData['sensors'])) {
                $sensorsData = $sensorData['sensors'];
                Log::info("Found nested sensors structure");
            }
            
            foreach ($sensorFields as $field) {
                if (isset($sensorsData[$field]) && is_numeric($sensorsData[$field])) {
                    $hasValidSensorData = true;
                    Log::info("Found valid sensor field: {$field} = " . $sensorsData[$field]);
                    break;
                }
            }
            
            if (!$hasValidSensorData) {
                Log::warning('No valid sensor data found in: ' . json_encode($sensorsData));
                Log::warning('Available fields: ' . implode(', ', array_keys($sensorsData)));
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'No valid sensor data found',
                    'error' => 'Response contains no numeric sensor fields'
                ], 500)->header('Content-Type', 'application/json');
            }

            // Parse Antares timestamp format: 20250703T071149
            $antaresTimestamp = $data['m2m:cin']['ct'] ?? null;
            $timestamp = $this->parseAntaresTimestamp($antaresTimestamp);
            
            Log::info('Successfully parsed real Antares data: ' . json_encode($sensorData));
            Log::info('Parsed timestamp: ' . $timestamp);
            
            // Format response for frontend with real data
            // Use sensorsData if we have nested structure
            $finalSensorData = isset($sensorData['sensors']) && is_array($sensorData['sensors']) 
                ? $sensorData['sensors'] 
                : $sensorData;
                
            $realData = [
                'timestamp' => $timestamp,
                'current_in' => (float) ($finalSensorData['current_in'] ?? 0),
                'current_out' => (float) ($finalSensorData['current_out'] ?? 0),
                'voltage_in' => (float) ($finalSensorData['voltage_in'] ?? 0),
                'voltage_out' => (float) ($finalSensorData['voltage_out'] ?? 0),
                'temperature' => (float) ($finalSensorData['temperature'] ?? 0),
                'battery_percentage' => (float) ($finalSensorData['battery_percentage'] ?? 0),
                'created_at' => $timestamp
            ];
            
            Log::info('Returning real Antares data: ' . json_encode($realData));
            
            return response()->json([
                'status' => 'success',
                'data' => $realData,
                'message' => 'Real data from Antares',
                'source' => 'antares'
            ])->header('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            Log::error('Antares connection error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch data from Antares',
                'error' => $e->getMessage()
            ], 500)->header('Content-Type', 'application/json');
        }
    }
    
    /**
     * Parse Antares timestamp format: 20250703T071149
     */
    private function parseAntaresTimestamp($timestamp)
    {
        if (!$timestamp) {
            return now()->toISOString();
        }
        
        try {
            // Antares format: 20250703T071149
            // Convert to: 2025-07-03T07:11:49
            if (preg_match('/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/', $timestamp, $matches)) {
                $year = $matches[1];
                $month = $matches[2];
                $day = $matches[3];
                $hour = $matches[4];
                $minute = $matches[5];
                $second = $matches[6];
                
                $formatted = "{$year}-{$month}-{$day}T{$hour}:{$minute}:{$second}Z";
                return $formatted;
            }
            
            // If already in correct format, return as is
            return $timestamp;
            
        } catch (\Exception $e) {
            Log::warning('Failed to parse Antares timestamp: ' . $timestamp . ' - ' . $e->getMessage());
            return now()->toISOString();
        }
    }
    
    /**
     * Get sensor data by type from Antares
     */
    public function getSensorDataByType(Request $request, $sensorType)
    {
        try {
            $range = $request->get('range', '1h');
            
            // Validasi sensor type
            $validSensorTypes = [
                'current_in', 'current_out', 'voltage_in', 'voltage_out',
                'temperature', 'lux', 'battery_percentage'
            ];
            
            if (!in_array($sensorType, $validSensorTypes)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid sensor type',
                    'valid_types' => $validSensorTypes
                ], 400);
            }
            
            // Untuk range pendek, gunakan data real-time dari Antares
            if (!in_array($range, ['1m', '3m', '10m', '1h'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Antares endpoint only supports short time ranges (1m, 3m, 10m, 1h)',
                    'range' => $range
                ], 400);
            }
            
            Log::info("Fetching Antares data for sensor: {$sensorType}, range: {$range}");
            
            $url = "{$this->antaresBaseUrl}/~/antares-cse/antares-id/{$this->applicationName}/{$this->deviceName}/la";
            
            $response = Http::withHeaders([
                'X-M2M-Origin' => $this->accessKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->timeout(10)->get($url);
            
            if (!$response->successful()) {
                Log::error('Antares API error: ' . $response->body());
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to fetch data from Antares',
                    'error' => $response->body()
                ], 500);
            }
            
            $data = $response->json();
            
            // Parse data sesuai dengan format yang ada
            $parsedData = $this->parseAntaresData($data);
            
            if (!$parsedData) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No valid data received from Antares',
                    'raw_data' => $data
                ], 404);
            }
            
            // Filter data berdasarkan sensor type
            $sensorValue = $parsedData[$sensorType] ?? null;
            
            if ($sensorValue === null) {
                return response()->json([
                    'status' => 'error',
                    'message' => "No data found for sensor type: {$sensorType}",
                    'available_sensors' => array_keys($parsedData)
                ], 404);
            }
            
            // Format data untuk chart (single point untuk real-time)
            $chartData = [
                [
                    'timestamp' => now()->toISOString(),
                    'value' => (float) $sensorValue
                ]
            ];
            
            // Untuk range yang lebih panjang, replikasi data dengan timestamp yang berbeda
            if ($range !== '1m') {
                $chartData = $this->generateTimeSeriesData($sensorValue, $range);
            }
            
            Log::info("Antares data fetched successfully for {$sensorType}: {$sensorValue}");
            
            return response()->json([
                'status' => 'success',
                'data' => $chartData,
                'sensor_type' => $sensorType,
                'range' => $range,
                'count' => count($chartData),
                'source' => 'antares'
            ]);
            
        } catch (\Exception $e) {
            Log::error("Antares sensor data API error for {$sensorType}: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch Antares data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generate time series data for longer ranges (mock data from single point)
     */
    private function generateTimeSeriesData($value, $range)
    {
        $data = [];
        $now = now();
        
        // Tentukan jumlah data points berdasarkan range
        $dataPoints = 10; // Default
        $intervalMinutes = 1; // Default
        
        switch ($range) {
            case '3m':
                $dataPoints = 3;
                $intervalMinutes = 1;
                break;
            case '10m':
                $dataPoints = 10;
                $intervalMinutes = 1;
                break;
            case '1h':
                $dataPoints = 12;
                $intervalMinutes = 5;
                break;
        }
        
        // Generate data points dengan variasi kecil untuk simulasi
        for ($i = $dataPoints - 1; $i >= 0; $i--) {
            $timestamp = $now->copy()->subMinutes($i * $intervalMinutes);
            $variation = (rand(-5, 5) / 100) * $value; // ±5% variasi
            $data[] = [
                'timestamp' => $timestamp->toISOString(),
                'value' => (float) round($value + $variation, 2)
            ];
        }
        
        return $data;
    }

    // ...existing code...
}
