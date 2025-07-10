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
        if (!Schema::hasTable('sensor_data')) {
            Schema::create('sensor_data', function (Blueprint $table) {
                $table->id();
                $table->string('device_id')->default('NANO_001');
                $table->timestamp('timestamp');
                $table->decimal('current_in', 8, 3)->nullable();
                $table->decimal('current_out', 8, 3)->nullable();
                $table->decimal('voltage_in', 8, 3)->nullable();
                $table->decimal('voltage_out', 8, 3)->nullable();
                $table->decimal('temperature', 5, 2)->nullable();
                // $table->decimal('lux', 8, 2)->nullable(); // removed
                $table->decimal('battery_percentage', 5, 2)->nullable();
                $table->timestamps();
                
                $table->index(['device_id', 'timestamp']);
                $table->index(['timestamp']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensor_data');
    }
};
