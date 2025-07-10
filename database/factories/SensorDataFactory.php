<?php

namespace Database\Factories;

use App\Models\SensorData;
use Illuminate\Database\Eloquent\Factories\Factory;

class SensorDataFactory extends Factory
{
    protected $model = SensorData::class;

    public function definition()
    {
        return [
            'sensor_id' => null, // This will be set by the relationship
            'value' => $this->faker->randomFloat(2, 0, 100),
            'recorded_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
