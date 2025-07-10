<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Log;

class UserController extends Controller {
    public function updatePassword(Request $request) {
        $user = $request->user();
        
        $request->validate([
            'oldPassword' => 'required',
            'newPassword' => 'required|min:6|confirmed',
        ]);
        
        if (!Hash::check($request->oldPassword, $user->password)) {
            throw ValidationException::withMessages([
                'oldPassword' => ['Password lama tidak sesuai.'],
            ]);
        }
        
        $user->password = Hash::make($request->newPassword);
        $user->save();
        
        // Log the password change activity
        Log::createActivity(
            $user->id,
            Log::ACTIVITY_PASSWORD_CHANGE,
            'Password akun berhasil diperbarui'
        );
        
        return redirect()->back()->with('success', 'Password berhasil diubah.');
    }
    
    public function updateProfile(Request $request) {
        $user = $request->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);
        
        $oldName = $user->name;
        $oldEmail = $user->email;
        
        $user->update($request->only(['name','email']));
        
        // Log the profile update activity
        $changes = [];
        if ($oldName !== $request->name) {
            $changes[] = "nama dari '{$oldName}' ke '{$request->name}'";
        }
        if ($oldEmail !== $request->email) {
            $changes[] = "email dari '{$oldEmail}' ke '{$request->email}'";
        }
        
        $description = 'Profil diperbarui: ' . implode(', ', $changes);
        
        Log::createActivity(
            $user->id,
            Log::ACTIVITY_PROFILE_UPDATE,
            $description
        );
        
        return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
    }
}
