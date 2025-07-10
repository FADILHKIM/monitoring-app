<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user registration.
     */
    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => 'active', // Status awal adalah pending
        ]);

        Auth::login($user);

        // Log successful registration and login
        Log::createActivity(
            $user->id,
            Log::ACTIVITY_LOGIN,
            'Berhasil mendaftar dan masuk ke sistem untuk pertama kali'
        );

        return redirect()->intended('/dashboard');
    }

    /**
     * Handle user login.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Find the user by email for logging purposes
        $user = User::where('email', $request->email)->first();

        if (Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            $request->session()->regenerate();
            
            // Log successful login
            Log::createActivity(
                Auth::id(),
                Log::ACTIVITY_LOGIN,
                'Berhasil masuk ke sistem'
            );
            
            return redirect()->intended('/dashboard');
        }

        // Log failed login attempt if user exists
        if ($user) {
            Log::createActivity(
                $user->id,
                Log::ACTIVITY_LOGIN,
                'Percobaan login dengan password yang salah',
                Log::STATUS_FAILED
            );
        }

        throw ValidationException::withMessages([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }
}