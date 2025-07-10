<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\DeviceStatus;

class StatusController extends Controller {
    public function index() {
        $statuses = DeviceStatus::all();
        return response()->json(['data'=>$statuses]);
    }
    public function update(Request $request, $device) {
        $status = DeviceStatus::updateOrCreate(
            ['device'=>$device],
            ['status'=>$request->status, 'updated_at'=>now()]
        );
        return response()->json(['success'=>true,'data'=>$status]);
    }
}
