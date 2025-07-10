<?php

namespace Database\Factories;

use App\Models\Sensor;
use Illuminate\Database\Eloquent\Factories\Factory;

class SensorFactory extends Factory
{
    protected $model = Sensor::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
            'type' => $this->faker->randomElement(['temperature', 'humidity', 'pressure']),
            'location' => $this->faker->city,
        ];
    }

    public function hasData($count = 10)
    {
        return $this->has(SensorData::factory()->count($count), 'data');
    }
}
