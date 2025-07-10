<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\SensorDataCacheService;
use Carbon\Carbon;

class SensorDataController extends Controller
{
    protected $cacheService;
    
    public function __construct(SensorDataCacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * API endpoint for real-time data (dengan caching untuk efisiensi)
     */
    public function realtime()
    {
        try {
            // Coba ambil dari cache terlebih dahulu (cache 30 detik)
            $cachedData = $this->cacheService->getLatestSensorData();
            
            if ($cachedData) {
                return response()->json([
                    'status' => 'success',
                    'data' => $cachedData,
                    'source' => 'cache'
                ])->header('Content-Type', 'application/json');
            }
            
            // Jika tidak ada di cache, ambil dari database
            $latestData = DB::table('sensor_data')
                ->select([
                    'timestamp',
                    'current_in',
                    'current_out',
                    'voltage_in',
                    'voltage_out',
                    'temperature',
                    'battery_percentage'
                ])
                ->where('timestamp', '>=', Carbon::now()->subMinutes(10))
                ->orderBy('timestamp', 'desc')
                ->first();
            
            if (!$latestData) {
                // If no recent data, get the latest available data
                $latestData = DB::table('sensor_data')
                    ->select([
                        'timestamp',
                        'current_in',
                        'current_out',
                        'voltage_in',
                        'voltage_out',
                        'temperature',
                        'battery_percentage'
                    ])
                    ->orderBy('timestamp', 'desc')
                    ->first();
            }
            
            if (!$latestData) {
                return response()->json([
                    'status' => 'success',
                    'data' => null,
                    'message' => 'No data available'
                ])->header('Content-Type', 'application/json');
            }
            
            $formattedData = [
                'timestamp' => $latestData->timestamp,
                'current_in' => (float) $latestData->current_in,
                'current_out' => (float) $latestData->current_out,
                'voltage_in' => (float) $latestData->voltage_in,
                'voltage_out' => (float) $latestData->voltage_out,
                'temperature' => (float) $latestData->temperature,
                'battery_percentage' => (float) $latestData->battery_percentage,
                'created_at' => $latestData->timestamp
            ];
            
            // Cache data untuk request selanjutnya
            $this->cacheService->cacheLatestSensorData($formattedData);
            
            return response()->json([
                'status' => 'success',
                'data' => $formattedData,
                'source' => 'database'
            ])->header('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            Log::error('Realtime API error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch data',
                'error' => $e->getMessage()
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * API endpoint untuk historical data (dengan caching berdasarkan time range)
     */
    public function historical(Request $request)
    {
        try {
            $range = $request->get('range', '1h');
            
            // Coba ambil dari cache terlebih dahulu untuk data yang sering diakses
            $cacheKey = "historical_data_{$range}";
            $cachedData = $this->cacheService->getCachedData($cacheKey);
            
            if ($cachedData) {
                return response()->json([
                    'status' => 'success',
                    'data' => $cachedData['data'],
                    'range' => $range,
                    'count' => count($cachedData['data']),
                    'source' => 'cache'
                ])->header('Content-Type', 'application/json');
            }
            
            $timeRange = $this->parseTimeRange($range);
            
            // Tentukan interval grouping berdasarkan range
            $groupSelect = [];
            $groupBy = null;
            switch ($range) {
                case '1h':
                case '6h':
                case '12h':
                    // Data asli, tidak di-group
                    $data = DB::table('sensor_data')
                        ->select([
                            'timestamp as time_group',
                            'current_in',
                            'current_out',
                            'voltage_in',
                            'voltage_out',
                            'temperature',
                            'battery_percentage'
                        ])
                        ->where('timestamp', '>=', $timeRange['start'])
                        ->where('timestamp', '<=', $timeRange['end'])
                        ->orderBy('timestamp', 'asc')
                        ->get();
                    break;
                case '1d':
                    // Group per 2 jam (12 data points), label: YYYY-MM-DD HH:00:00
                    $data = DB::table('sensor_data')
                        ->select([
                            DB::raw("CONCAT(DATE(timestamp), ' ', LPAD(FLOOR(HOUR(timestamp)/2)*2,2,'0'), ':00:00') as time_group"),
                            DB::raw('AVG(current_in) as current_in'),
                            DB::raw('AVG(current_out) as current_out'),
                            DB::raw('AVG(voltage_in) as voltage_in'),
                            DB::raw('AVG(voltage_out) as voltage_out'),
                            DB::raw('AVG(temperature) as temperature'),
                            DB::raw('AVG(battery_percentage) as battery_percentage')
                        ])
                        ->where('timestamp', '>=', $timeRange['start'])
                        ->where('timestamp', '<=', $timeRange['end'])
                        ->groupBy(DB::raw("CONCAT(DATE(timestamp), ' ', LPAD(FLOOR(HOUR(timestamp)/2)*2,2,'0'), ':00:00')"))
                        ->orderBy('time_group', 'asc')
                        ->get()
                        ->map(function ($item) {
                            return [
                                'time_group' => $item->time_group,
                                'current_in' => round((float) ($item->current_in ?? 0), 3),
                                'current_out' => round((float) ($item->current_out ?? 0), 3),
                                'voltage_in' => round((float) ($item->voltage_in ?? 0), 3),
                                'voltage_out' => round((float) ($item->voltage_out ?? 0), 3),
                                'temperature' => round((float) ($item->temperature ?? 0), 2),
                                'battery_percentage' => round((float) ($item->battery_percentage ?? 0), 2)
                            ];
                        });
                    break;
                case '15d':
                case '1mo':
                    // Group per hari
                    $data = DB::table('sensor_data')
                        ->select([
                            DB::raw('DATE(timestamp) as time_group'),
                            DB::raw('AVG(current_in) as current_in'),
                            DB::raw('AVG(current_out) as current_out'),
                            DB::raw('AVG(voltage_in) as voltage_in'),
                            DB::raw('AVG(voltage_out) as voltage_out'),
                            DB::raw('AVG(temperature) as temperature'),
                            DB::raw('AVG(battery_percentage) as battery_percentage')
                        ])
                        ->where('timestamp', '>=', $timeRange['start'])
                        ->where('timestamp', '<=', $timeRange['end'])
                        ->groupBy(DB::raw('DATE(timestamp)'))
                        ->orderBy('time_group', 'asc')
                        ->get()
                        ->map(function ($item) {
                            return [
                                'time_group' => $item->time_group,
                                'current_in' => round((float) ($item->current_in ?? 0), 3),
                                'current_out' => round((float) ($item->current_out ?? 0), 3),
                                'voltage_in' => round((float) ($item->voltage_in ?? 0), 3),
                                'voltage_out' => round((float) ($item->voltage_out ?? 0), 3),
                                'temperature' => round((float) ($item->temperature ?? 0), 2),
                                'battery_percentage' => round((float) ($item->battery_percentage ?? 0), 2)
                            ];
                        });
                    break;
                case '3mo':
                    // Group per 3 hari (sekitar 30 data points), label: tanggal awal interval 3 hari
                    $data = DB::table('sensor_data')
                        ->select([
                            DB::raw('DATE(DATE_SUB(timestamp, INTERVAL (MOD(DAYOFYEAR(timestamp)-1,3)) DAY)) as time_group'),
                            DB::raw('AVG(current_in) as current_in'),
                            DB::raw('AVG(current_out) as current_out'),
                            DB::raw('AVG(voltage_in) as voltage_in'),
                            DB::raw('AVG(voltage_out) as voltage_out'),
                            DB::raw('AVG(temperature) as temperature'),
                            DB::raw('AVG(battery_percentage) as battery_percentage')
                        ])
                        ->where('timestamp', '>=', $timeRange['start'])
                        ->where('timestamp', '<=', $timeRange['end'])
                        ->groupBy(DB::raw('DATE(DATE_SUB(timestamp, INTERVAL (MOD(DAYOFYEAR(timestamp)-1,3)) DAY))'))
                        ->orderBy('time_group', 'asc')
                        ->get()
                        ->map(function ($item) {
                            return [
                                'time_group' => $item->time_group,
                                'current_in' => round((float) ($item->current_in ?? 0), 3),
                                'current_out' => round((float) ($item->current_out ?? 0), 3),
                                'voltage_in' => round((float) ($item->voltage_in ?? 0), 3),
                                'voltage_out' => round((float) ($item->voltage_out ?? 0), 3),
                                'temperature' => round((float) ($item->temperature ?? 0), 2),
                                'battery_percentage' => round((float) ($item->battery_percentage ?? 0), 2)
                            ];
                        });
                    break;
                case 'all':
                    // Group per minggu (maks 52 data points)
                    $data = DB::table('sensor_data')
                        ->select([
                            DB::raw('YEAR(timestamp) as y'),
                            DB::raw('WEEK(timestamp, 1) as w'),
                            DB::raw('MIN(DATE(timestamp)) as min_time'),
                            DB::raw('AVG(current_in) as current_in'),
                            DB::raw('AVG(current_out) as current_out'),
                            DB::raw('AVG(voltage_in) as voltage_in'),
                            DB::raw('AVG(voltage_out) as voltage_out'),
                            DB::raw('AVG(temperature) as temperature'),
                            DB::raw('AVG(battery_percentage) as battery_percentage')
                        ])
                        ->where('timestamp', '>=', $timeRange['start'])
                        ->where('timestamp', '<=', $timeRange['end'])
                        ->groupBy(DB::raw('YEAR(timestamp)'), DB::raw('WEEK(timestamp, 1)'))
                        ->orderBy('min_time', 'asc')
                        ->get()
                        ->map(function ($item) {
                            return [
                                'time_group' => $item->min_time, // label tanggal awal minggu
                                'week_label' => $item->y.'-W'.str_pad($item->w,2,'0',STR_PAD_LEFT), // label kode week
                                'current_in' => round((float) ($item->current_in ?? 0), 3),
                                'current_out' => round((float) ($item->current_out ?? 0), 3),
                                'voltage_in' => round((float) ($item->voltage_in ?? 0), 3),
                                'voltage_out' => round((float) ($item->voltage_out ?? 0), 3),
                                'temperature' => round((float) ($item->temperature ?? 0), 2),
                                'battery_percentage' => round((float) ($item->battery_percentage ?? 0), 2)
                            ];
                        });
                    break;
                default:
                    // Default: tampilkan data asli
                    $data = DB::table('sensor_data')
                        ->select([
                            'timestamp as time_group',
                            'current_in',
                            'current_out',
                            'voltage_in',
                            'voltage_out',
                            'temperature',
                            'battery_percentage'
                        ])
                        ->where('timestamp', '>=', $timeRange['start'])
                        ->where('timestamp', '<=', $timeRange['end'])
                        ->orderBy('timestamp', 'asc')
                        ->get();
                    break;
            }
            
            // Cache data untuk request selanjutnya
            $cacheTime = match($range) {
                '10m', '1h' => 2, // 2 menit untuk data real-time
                '6h', '1d' => 10, // 10 menit untuk data harian
                '7d', '30d', '1mo' => 60, // 1 jam untuk data mingguan/bulanan
                'all' => 120, // 2 jam untuk data all time
                default => 5
            };
            
            $this->cacheService->cacheData($cacheKey, ['data' => $data], $cacheTime);
            
            return response()->json([
                'status' => 'success',
                'data' => $data,
                'range' => $range,
                'count' => $data->count(),
                'source' => 'database'
            ])->header('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            Log::error('Historical API error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch historical data',
                'error' => $e->getMessage()
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Get log data for Log page with date filtering (dengan caching dan pagination)
     */
    public function getLogData(Request $request)
    {
        try {
            $startDate = $request->input('start');
            $endDate = $request->input('end');
            $page = $request->input('page', 1);
            $perPage = $request->input('per_page', 100);
            
            // Buat cache key berdasarkan parameter
            $cacheKey = "log_data_" . md5("{$startDate}_{$endDate}_{$page}_{$perPage}");
            $cachedData = $this->cacheService->getCachedData($cacheKey);
            
            if ($cachedData) {
                return response()->json([
                    'status' => 'success',
                    'data' => $cachedData['data'],
                    'total' => $cachedData['total'],
                    'page' => $page,
                    'per_page' => $perPage,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'source' => 'cache'
                ])->header('Content-Type', 'application/json');
            }
            
            $query = DB::table('sensor_data')
                ->select([
                    'timestamp',
                    'current_in',
                    'current_out',
                    'voltage_in',
                    'voltage_out',
                    'temperature',
                    'battery_percentage'
                ])
                ->orderBy('timestamp', 'desc');
            
            // Apply date filters if provided
            if ($startDate) {
                $query->where('timestamp', '>=', Carbon::parse($startDate)->startOfDay());
            }
            
            if ($endDate) {
                $query->where('timestamp', '<=', Carbon::parse($endDate)->endOfDay());
            }
            
            // Get total count for pagination
            $totalCount = $query->count();
            
            // Apply pagination
            $offset = ($page - 1) * $perPage;
            $data = $query->offset($offset)->limit($perPage)->get();
            
            // Cache the result for 5 minutes
            $result = [
                'data' => $data,
                'total' => $totalCount
            ];
            $this->cacheService->cacheData($cacheKey, $result, 5);
            
            return response()->json([
                'status' => 'success',
                'data' => $data,
                'total' => $totalCount,
                'page' => $page,
                'per_page' => $perPage,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'source' => 'database'
            ])->header('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            Log::error('Log data fetch error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch log data',
                'error' => $e->getMessage()
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * System status API untuk monitoring page
     */
    public function systemStatus()
    {
        try {
            // Cache system status untuk 1 menit
            $cachedStatus = $this->cacheService->getCachedData('system_status');
            
            if ($cachedStatus) {
                return response()->json([
                    'status' => 'success',
                    'data' => $cachedStatus,
                    'source' => 'cache'
                ])->header('Content-Type', 'application/json');
            }
            
            // Cek database connection
            $databaseStatus = 'connected';
            try {
                DB::connection()->getPdo();
            } catch (\Exception $e) {
                $databaseStatus = 'error';
            }
            
            // Cek sensor data availability
            $sensorsStatus = 'connected';
            $recentDataCount = DB::table('sensor_data')
                ->where('timestamp', '>=', Carbon::now()->subMinutes(30))
                ->count();
            
            if ($recentDataCount === 0) {
                $sensorsStatus = 'warning';
            }
            
            // Performance metrics
            $performanceMetrics = $this->cacheService->getPerformanceMetrics();
            
            // Recent events
            $recentEvents = [
                [
                    'type' => 'success',
                    'event' => 'System startup completed',
                    'time' => Carbon::now()->subMinutes(5)->format('H:i')
                ],
                [
                    'type' => 'info',
                    'event' => 'Data collection active',
                    'time' => Carbon::now()->subMinutes(2)->format('H:i')
                ]
            ];
            
            $statusData = [
                'api' => ['status' => 'connected'],
                'database' => ['status' => $databaseStatus],
                'sensors' => ['status' => $sensorsStatus],
                'network' => ['status' => 'connected'],
                'performance' => $performanceMetrics,
                'recent_events' => $recentEvents,
                'last_check' => Carbon::now()->toISOString()
            ];
            
            // Cache untuk 1 menit
            $this->cacheService->cacheData('system_status', $statusData, 1);
            
            return response()->json([
                'status' => 'success',
                'data' => $statusData,
                'source' => 'database'
            ])->header('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            Log::error('System status error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get system status',
                'error' => $e->getMessage()
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Export log data to CSV
     */
    public function exportLogCsv(Request $request)
    {
        try {
            $startDate = $request->input('start');
            $endDate = $request->input('end');
            
            $query = DB::table('sensor_data')
                ->select([
                    'timestamp',
                    'current_in',
                    'current_out',
                    'voltage_in',
                    'voltage_out',
                    'temperature',
                    'lux',
                    'battery_percentage'
                ])
                ->orderBy('timestamp', 'desc');
            
            // Apply date filters if provided
            if ($startDate) {
                $query->where('timestamp', '>=', Carbon::parse($startDate)->startOfDay());
            }
            
            if ($endDate) {
                $query->where('timestamp', '<=', Carbon::parse($endDate)->endOfDay());
            }
            
            $data = $query->get();
            
            // Log the export activity if user is authenticated
            if (Auth::check()) {
                $dateRange = '';
                if ($startDate && $endDate) {
                    $dateRange = " periode {$startDate} - {$endDate}";
                } elseif ($startDate) {
                    $dateRange = " mulai {$startDate}";
                } elseif ($endDate) {
                    $dateRange = " hingga {$endDate}";
                }
                
                \App\Models\Log::createActivity(
                    Auth::id(),
                    \App\Models\Log::ACTIVITY_EXPORT_DATA,
                    "Export data sensor dalam format CSV{$dateRange}"
                );
            }
            
            $filename = 'sensor_log_' . date('Y-m-d_H-i-s') . '.csv';
            
            // Build CSV content manually with UTF-8 BOM for proper Excel compatibility
            $csvContent = "\xEF\xBB\xBF"; // UTF-8 BOM
            
            // Headers - using semicolon separator for Excel compatibility
            $headers = [
                'Timestamp',
                'Arus Masuk (A)',
                'Arus Keluar (A)', 
                'Tegangan Masuk (V)',
                'Tegangan Keluar (V)',
                'Suhu (°C)',
                'Intensitas Cahaya (Lux)',
                'Persentase Baterai (%)'
            ];
            $csvContent .= implode(';', $headers) . "\r\n";
            
            // Data rows - format numbers for Indonesian locale (comma as decimal separator)
            foreach ($data as $row) {
                $rowData = [
                    $row->timestamp,
                    number_format($row->current_in ?? 0, 3, ',', '.'),
                    number_format($row->current_out ?? 0, 3, ',', '.'),
                    number_format($row->voltage_in ?? 0, 3, ',', '.'),
                    number_format($row->voltage_out ?? 0, 3, ',', '.'),
                    number_format($row->temperature ?? 0, 2, ',', '.'),
                    number_format($row->lux ?? 0, 2, ',', '.'),
                    number_format($row->battery_percentage ?? 0, 2, ',', '.')
                ];
                
                // Escape any values that contain semicolons or quotes
                $escapedData = array_map(function($value) {
                    if (strpos($value, ';') !== false || strpos($value, '"') !== false) {
                        return '"' . str_replace('"', '""', $value) . '"';
                    }
                    return $value;
                }, $rowData);
                
                $csvContent .= implode(';', $escapedData) . "\r\n";
            }
            
            return response($csvContent, 200, [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0'
            ]);
            
        } catch (\Exception $e) {
            Log::error('CSV export error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to export CSV',
                'error' => $e->getMessage()
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Export log data to PDF
     */
    public function exportLogPdf(Request $request)
    {
        try {
            $startDate = $request->input('start');
            $endDate = $request->input('end');
            $query = DB::table('sensor_data')
                ->select([
                    'timestamp',
                    'current_in',
                    'current_out',
                    'voltage_in',
                    'voltage_out',
                    'temperature',
                    'lux',
                    'battery_percentage'
                ])
                ->orderBy('timestamp', 'desc');
            // Apply date filters if provided
            if ($startDate) {
                $query->where('timestamp', '>=', \Carbon\Carbon::parse($startDate)->startOfDay());
            }
            if ($endDate) {
                $query->where('timestamp', '<=', \Carbon\Carbon::parse($endDate)->endOfDay());
            }
            $data = $query->get();
            // Log the export activity if user is authenticated
            if (\Auth::check()) {
                $dateRange = '';
                if ($startDate && $endDate) {
                    $dateRange = " periode {$startDate} - {$endDate}";
                } elseif ($startDate) {
                    $dateRange = " mulai {$startDate}";
                } elseif ($endDate) {
                    $dateRange = " hingga {$endDate}";
                }
                \App\Models\Log::createActivity(
                    \Auth::id(),
                    \App\Models\Log::ACTIVITY_EXPORT_DATA,
                    "Export data sensor dalam format PDF{$dateRange}"
                );
            }
            // Render PDF view (make sure you have resources/views/pdf/sensor-log.blade.php)
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.sensor-log', [
                'data' => $data,
                'startDate' => $startDate,
                'endDate' => $endDate
            ]);
            $filename = 'sensor_log_' . date('Y-m-d_H-i-s') . '.pdf';
            return $pdf->download($filename);
        } catch (\Exception $e) {
            \Log::error('PDF export error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to export PDF',
                'error' => $e->getMessage()
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Store sensor data from IoT device or webhook
     */
    public function storeSensorData(Request $request)
    {
        try {
            $data = $request->validate([
                'sensors' => 'required|array',
                'sensors.current_in' => 'required|numeric',
                'sensors.current_out' => 'required|numeric',
                'sensors.voltage_in' => 'required|numeric',
                'sensors.voltage_out' => 'required|numeric',
                'sensors.temperature' => 'required|numeric',
                'sensors.lux' => 'required|numeric',
                'sensors.battery_percentage' => 'required|numeric',
                'timestamp' => 'nullable|string'
            ]);

            $timestamp = $data['timestamp'] ? Carbon::parse($data['timestamp']) : Carbon::now();

            DB::table('sensor_data')->insert([
                'timestamp' => $timestamp,
                'current_in' => $data['sensors']['current_in'],
                'current_out' => $data['sensors']['current_out'],
                'voltage_in' => $data['sensors']['voltage_in'],
                'voltage_out' => $data['sensors']['voltage_out'],
                'temperature' => $data['sensors']['temperature'],
                'lux' => $data['sensors']['lux'],
                'battery_percentage' => $data['sensors']['battery_percentage'],
                'created_at' => now()
            ]);

            // Clear cache setelah ada data baru
            $this->cacheService->clearCache('latest_sensor_data');
            $this->cacheService->clearCache('system_status');

            return response()->json([
                'status' => 'success',
                'message' => 'Data stored successfully'
            ])->header('Content-Type', 'application/json');

        } catch (\Exception $e) {
            Log::error('Store sensor data error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to store data',
                'error' => $e->getMessage()
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * API endpoint untuk mendapatkan data sensor berdasarkan tipe dan time range
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
            
            // Cache key untuk data spesifik sensor
            $cacheKey = "sensor_data_{$sensorType}_{$range}";
            $cachedData = $this->cacheService->getCachedData($cacheKey);
            
            if ($cachedData) {
                return response()->json([
                    'status' => 'success',
                    'data' => $cachedData['data'],
                    'sensor_type' => $sensorType,
                    'range' => $range,
                    'count' => count($cachedData['data']),
                    'source' => 'cache'
                ]);
            }
            
            $timeRange = $this->parseTimeRange($range);
            
            // Tentukan interval grouping berdasarkan range
            $groupInterval = $this->getGroupInterval($range);
            
            $query = DB::table('sensor_data')
                ->select([
                    DB::raw("DATE_FORMAT(timestamp, '{$groupInterval}') as time_group"),
                    DB::raw("AVG({$sensorType}) as value"),
                    DB::raw('MAX(timestamp) as timestamp')
                ])
                ->where('timestamp', '>=', $timeRange['start'])
                ->where('timestamp', '<=', $timeRange['end'])
                ->whereNotNull($sensorType)
                ->groupBy('time_group')
                ->orderBy('timestamp', 'asc');
            
            $data = $query->get()->map(function ($item) {
                return [
                    'timestamp' => $item->timestamp,
                    'value' => round((float)$item->value, 2)
                ];
            });
            
            // Cache hasil untuk 1 menit untuk data pendek, 5 menit untuk data panjang
            $cacheMinutes = in_array($range, ['1m', '3m', '10m', '1h']) ? 1 : 5;
            $this->cacheService->setCachedData($cacheKey, ['data' => $data], $cacheMinutes);
            
            return response()->json([
                'status' => 'success',
                'data' => $data,
                'sensor_type' => $sensorType,
                'range' => $range,
                'count' => count($data),
                'source' => 'database'
            ]);
            
        } catch (\Exception $e) {
            Log::error("Sensor data API error for {$sensorType}: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch sensor data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menentukan interval grouping berdasarkan time range
     */
    private function getGroupInterval($range)
    {
        switch ($range) {
            case '1m':
            case '3m':
            case '10m':
                return '%Y-%m-%d %H:%i:%s'; // Per detik untuk range pendek
            case '1h':
                return '%Y-%m-%d %H:%i:00'; // Per menit
            case '6h':
                return '%Y-%m-%d %H:00:00'; // Per jam
            case '1d':
                return '%Y-%m-%d %H:00:00'; // Per jam (24 point)
            case '1w':
                return '%Y-%m-%d 00:00:00'; // Per hari
            case '1mo':
            case 'all':
                return '%Y-%m-%d 00:00:00'; // Per hari untuk range panjang
            default:
                return '%Y-%m-%d %H:%i:00'; // Default per menit
        }
    }

    /**
     * Parse time range untuk historical data
     */
    private function parseTimeRange($range)
    {
        $end = Carbon::now();

        switch ($range) {
            case '1h':
                $start = $end->copy()->subHour();
                break;
            case '6h':
                $start = $end->copy()->subHours(6);
                break;
            case '12h':
                $start = $end->copy()->subHours(12);
                break;
            case '1d':
                $start = $end->copy()->subDay();
                break;
            case '15d':
                $start = $end->copy()->subDays(15);
                break;
            case '1mo':
                $start = $end->copy()->subMonth();
                break;
            case '3mo':
                $start = $end->copy()->subMonths(3);
                break;
            case 'all':
                // Get all data from the earliest record in sensor_data
                $minTimestamp = \DB::table('sensor_data')->min('timestamp');
                $start = $minTimestamp ? Carbon::parse($minTimestamp) : $end->copy()->subYears(10);
                break;
            default:
                $start = $end->copy()->subHour();
        }

        return ['start' => $start, 'end' => $end];
    }
}
