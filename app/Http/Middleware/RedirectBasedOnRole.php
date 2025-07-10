<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectBasedOnRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = session('user');
        if ($user) {
            // Debugging: Log user dan role
            \Log::info("User {$user['email']} role: " . ($user['role'] ?? 'none'));
            if (($user['role'] ?? null) === 'admin') {
                return redirect()->route('admin.dashboard');
            }
            if (($user['role'] ?? null) === 'user') {
                return redirect()->route('dashboard');
            }
            // Fallback untuk user tanpa role
            \Session::forget('user');
            return redirect('/login')->withErrors(['role' => 'Anda tidak memiliki role yang valid']);
        }
        return $next($request);
    }
}