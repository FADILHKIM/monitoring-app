<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes to sensor_data table for better query performance
        // Index 'timestamp' and ['device_id', 'timestamp'] already created in create_sensor_data_table_simple migration
        Schema::table('sensor_data', function (Blueprint $table) {
            $table->index('created_at', 'sensor_data_created_at_index');
        });

        // Add indexes to logs table
        Schema::table('logs', function (Blueprint $table) {
            $table->index('user_id', 'logs_user_id_index');
            $table->index('created_at', 'logs_created_at_index');
            $table->index(['user_id', 'created_at'], 'logs_user_created_index');
        });

        // Add indexes to users table if needed
        Schema::table('users', function (Blueprint $table) {
            $table->index('email', 'users_email_index');
        });

        // Add indexes to user_preferences table if it exists
        if (Schema::hasTable('user_preferences')) {
            Schema::table('user_preferences', function (Blueprint $table) {
                $table->index('user_id', 'user_preferences_user_id_index');
            });
        }

        // Add indexes to system_logs table if it exists
        if (Schema::hasTable('system_logs')) {
            Schema::table('system_logs', function (Blueprint $table) {
                $table->index('event_type', 'system_logs_event_type_index');
                $table->index('severity', 'system_logs_severity_index');
                $table->index(['event_type', 'created_at'], 'system_logs_type_created_index');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove indexes from sensor_data table
        Schema::table('sensor_data', function (Blueprint $table) {
            $table->dropIndex(['sensor_data_timestamp_index']);
            $table->dropIndex(['sensor_data_device_timestamp_index']);
            $table->dropIndex(['sensor_data_created_at_index']);
        });

        // Remove indexes from logs table
        Schema::table('logs', function (Blueprint $table) {
            $table->dropIndex(['logs_user_id_index']);
            $table->dropIndex(['logs_created_at_index']);
            $table->dropIndex(['logs_user_created_index']);
        });

        // Remove indexes from users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['users_email_index']);
        });

        // Remove indexes from user_preferences table
        if (Schema::hasTable('user_preferences')) {
            Schema::table('user_preferences', function (Blueprint $table) {
                $table->dropIndex(['user_preferences_user_id_index']);
            });
        }

        // Remove indexes from system_logs table
        if (Schema::hasTable('system_logs')) {
            Schema::table('system_logs', function (Blueprint $table) {
                $table->dropIndex(['system_logs_event_type_index']);
                $table->dropIndex(['system_logs_severity_index']);
                $table->dropIndex(['system_logs_type_created_index']);
            });
        }
    }
};
