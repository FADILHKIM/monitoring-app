<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    // Login page
    public function showLogin()
    {
        return inertia('Auth/Login');
    }

    // Register page
    public function showRegister()
    {
        return inertia('Auth/Register');
    }

    // Login action
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return back()->withErrors(['email' => 'Email atau password salah.']);
        }

        if ($user->status !== 'active') {
            return back()->withErrors(['email' => 'Akun Anda belum diaktifkan oleh admin.']);
        }

        Auth::login($user); // gunakan autentikasi Laravel
        $request->session()->regenerate(); // regenerasi session untuk keamanan

        // Catat log login sukses
        \App\Models\Log::createActivity(
            $user->id,
            \App\Models\Log::ACTIVITY_LOGIN,
            'Berhasil masuk ke sistem'
        );

        return redirect()->intended('/dashboard');
    }

    // Register action
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'status' => 'pending',
        ]);

        return redirect('/login')->with('status', 'Pendaftaran berhasil, menunggu persetujuan admin.');
    }

    // Logout
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }

    // Dashboard
    public function dashboard()
    {
        return inertia('User/Dashboard', [
            'user' => Auth::user()
        ]);
    }

    // Update password user/admin
    public function updatePassword(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'oldPassword' => 'required',
            'newPassword' => 'required|min:6|regex:/[a-z]/|regex:/[A-Z]/|regex:/[0-9]/|regex:/[^a-zA-Z0-9]/',
            'newPassword_confirmation' => 'required|same:newPassword',
        ]);

        if (!Hash::check($request->oldPassword, $user->password)) {
            return back()->withErrors(['oldPassword' => 'Password lama salah.']);
        }

        $user->password = Hash::make($request->newPassword);
        $user->save();

        return back()->with('status', 'Password berhasil diubah.');
    }
}
