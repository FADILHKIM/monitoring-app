<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use App\Http\Middleware\RedirectBasedOnRole;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'redirect.role' => RedirectBasedOnRole::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule) {
        // Database cleanup - run weekly 
        $schedule->command('db:cleanup', ['--days' => 90])
            ->weekly()
            ->name('weekly_cleanup');

        // Database optimization - run monthly
        $schedule->call(function () {
            \Illuminate\Support\Facades\DB::statement('OPTIMIZE TABLE sensor_data');
            \Log::info('Database optimization completed');
        })
            ->monthly()
            ->name('monthly_optimization');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
