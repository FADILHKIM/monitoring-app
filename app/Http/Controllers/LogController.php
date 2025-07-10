<?php
// File ini tidak digunakan lagi karena aplikasi sudah tidak menggunakan MySQL/XAMPP.

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SensorData;
use App\Models\Log;
use Illuminate\Support\Facades\Response;

class LogController extends Controller
{
    public function fetchHistoricalData()
    {
        $data = SensorData::orderBy('timestamp', 'desc')->get();
        return response()->json(['historical' => $data]);
    }
    public function getSensorLog(Request $request)
    {
        $query = SensorData::query();
        if ($request->has('start')) {
            $query->where('timestamp', '>=', $request->start);
        }
        if ($request->has('end')) {
            $query->where('timestamp', '<=', $request->end);
        }
        $data = $query->orderBy('timestamp', 'desc')->get();
        return response()->json(['data' => $data]);
    }
    public function exportLogToCsv(Request $request)
    {
        $query = SensorData::query();
        if ($request->has('start')) {
            $query->where('timestamp', '>=', $request->start);
        }
        if ($request->has('end')) {
            $query->where('timestamp', '<=', $request->end);
        }
        $data = $query->orderBy('timestamp', 'desc')->get();
        $csv = "timestamp,current_in,current_out,voltage_in,voltage_out,temperature,lux,battery_percentage\n";
        foreach ($data as $row) {
            $csv .= "{$row->timestamp},{$row->current_in},{$row->current_out},{$row->voltage_in},{$row->voltage_out},{$row->temperature},{$row->lux},{$row->battery_percentage}\n";
        }
        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="log.csv"',
        ]);
    }
    public function fetchHistoricalOptimized(Request $request)
    {
        $range = $request->query('range', '1h');
        $sensorId = $request->query('sensor_id', 1);
        $maxPoints = 300;
        $cacheMinutes = $range === '1h' ? 1 : ($range === '12h' ? 5 : 10);
        $interval = 'minute';
        $groupFormat = '%Y-%m-%d %H:%i';
        $start = now()->subHour();
        if ($range === '12h') {
            $start = now()->subHours(12);
            $interval = '5minute';
            $groupFormat = '%Y-%m-%d %H:%i';
        } elseif ($range === '1d') {
            $start = now()->subDay();
            $interval = '10minute';
            $groupFormat = '%Y-%m-%d %H:%i';
        } elseif ($range === '1w') {
            $start = now()->subWeek();
            $interval = 'hour';
            $groupFormat = '%Y-%m-%d %H:00';
        }
        $cacheKey = "sensor_{$sensorId}_{$range}";
        $data = \Cache::remember($cacheKey, now()->addMinutes($cacheMinutes), function () use ($sensorId, $start, $groupFormat, $maxPoints) {
            $query = \App\Models\SensorData::selectRaw(
                "DATE_FORMAT(timestamp, '{$groupFormat}') as time_group, 
                AVG(current_in) as current_in, AVG(current_out) as current_out, 
                AVG(voltage_in) as voltage_in, AVG(voltage_out) as voltage_out, 
                AVG(temperature) as temperature, AVG(lux) as lux, AVG(battery_percentage) as battery_percentage"
            )
            ->where('sensor_id', $sensorId)
            ->where('timestamp', '>=', $start)
            ->groupBy('time_group')
            ->orderBy('time_group', 'asc')
            ->limit($maxPoints)
            ->get();
            return $query;
        });
        return response()->json(['data' => $data]);
    }
    public function index(Request $request) {
        $userId = auth()->id();
        $logs = Log::where('user_id', $userId)->orderBy('created_at','desc')->get();
        return response()->json(['data'=>$logs]);
    }
    public function store(Request $request) {
        $log = Log::create($request->all());
        return response()->json(['success'=>true,'data'=>$log]);
    }
    public function destroy($id) {
        Log::destroy($id);
        return response()->json(['success'=>true]);
    }
}
