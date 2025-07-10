<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseCleanup extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'db:cleanup {--days=90 : Number of days to keep data} {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     */
    protected $description = 'Clean up old database records to optimize performance';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $dryRun = $this->option('dry-run');
        $cutoffDate = Carbon::now()->subDays($days);

        $this->info("Database cleanup starting...");
        $this->info("Cutoff date: {$cutoffDate->format('Y-m-d H:i:s')}");
        
        if ($dryRun) {
            $this->warn("DRY RUN MODE - No data will be deleted");
        }

        // Clean sensor_data older than specified days
        $sensorDataCount = DB::table('sensor_data')
            ->where('timestamp', '<', $cutoffDate)
            ->count();

        if ($sensorDataCount > 0) {
            $this->info("Found {$sensorDataCount} old sensor data records");
            
            if (!$dryRun) {
                if ($this->confirm("Delete {$sensorDataCount} sensor data records older than {$days} days?")) {
                    $deleted = DB::table('sensor_data')
                        ->where('timestamp', '<', $cutoffDate)
                        ->delete();
                    
                    $this->info("Deleted {$deleted} sensor data records");
                }
            }
        } else {
            $this->info("No old sensor data records found");
        }

        // Clean logs older than specified days
        $logsCount = DB::table('logs')
            ->where('created_at', '<', $cutoffDate)
            ->count();

        if ($logsCount > 0) {
            $this->info("Found {$logsCount} old log records");
            
            if (!$dryRun) {
                if ($this->confirm("Delete {$logsCount} log records older than {$days} days?")) {
                    $deleted = DB::table('logs')
                        ->where('created_at', '<', $cutoffDate)
                        ->delete();
                    
                    $this->info("Deleted {$deleted} log records");
                }
            }
        } else {
            $this->info("No old log records found");
        }

        // Clean system_logs older than 30 days (keep shorter) - only if table exists
        if (DB::getSchemaBuilder()->hasTable('system_logs')) {
            $systemLogsCount = DB::table('system_logs')
                ->where('created_at', '<', Carbon::now()->subDays(30))
                ->count();

            if ($systemLogsCount > 0) {
                $this->info("Found {$systemLogsCount} old system log records");
                
                if (!$dryRun) {
                    if ($this->confirm("Delete {$systemLogsCount} system log records older than 30 days?")) {
                        $deleted = DB::table('system_logs')
                            ->where('created_at', '<', Carbon::now()->subDays(30))
                            ->delete();
                        
                        $this->info("Deleted {$deleted} system log records");
                    }
                }
            } else {
                $this->info("No old system log records found");
            }
        } else {
            $this->info("System logs table does not exist, skipping...");
        }

        // Optimize tables
        if (!$dryRun) {
            $this->info("Optimizing database tables...");
            
            $tables = ['sensor_data', 'logs', 'users', 'user_preferences'];
            
            foreach ($tables as $table) {
                if (DB::getSchemaBuilder()->hasTable($table)) {
                    DB::statement("OPTIMIZE TABLE {$table}");
                    $this->info("Optimized table: {$table}");
                } else {
                    $this->info("Table {$table} does not exist, skipping optimization");
                }
            }
        }

        // Show database statistics
        $this->info("\n--- Database Statistics ---");
        
        $tables = ['sensor_data', 'logs', 'users', 'user_preferences'];
        foreach ($tables as $table) {
            if (DB::getSchemaBuilder()->hasTable($table)) {
                $count = DB::table($table)->count();
                $this->info("{$table}: {$count} records");
            } else {
                $this->info("{$table}: table does not exist");
            }
        }

        // Show disk usage
        $dbSize = DB::select("
            SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
        ")[0]->size_mb ?? 0;
        
        $this->info("Database size: {$dbSize} MB");

        $this->info("Database cleanup completed!");
    }
}
