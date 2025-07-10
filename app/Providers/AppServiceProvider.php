<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AppServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // Tambahkan ini untuk default redirect setelah login
        Route::redirect('/', '/login');
    }
}