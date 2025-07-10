<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\SensorData;

class SensorController extends Controller {
    public function realtime(Request $request) {
        $data = SensorData::orderBy('timestamp', 'desc')->first();
        return response()->json(['status'=>'success','data'=>$data]);
    }
    public function historical(Request $request) {
        $range = $request->input('range', '1h');
        $query = SensorData::query();
        if ($range === '10m') {
            $query->where('timestamp', '>=', now()->subMinutes(10));
        } else if ($range === '1h') {
            $query->where('timestamp', '>=', now()->subHour());
        } else if ($range === '24h') {
            $query->where('timestamp', '>=', now()->subDay());
        }
        $data = $query->orderBy('timestamp', 'desc')->get();
        return response()->json(['status'=>'success','data'=>$data]);
    }
    public function store(Request $request) {
        $data = SensorData::create($request->all());
        return response()->json(['success'=>true,'data'=>$data]);
    }
    public function destroy($id) {
        SensorData::destroy($id);
        return response()->json(['success'=>true]);
    }
}
