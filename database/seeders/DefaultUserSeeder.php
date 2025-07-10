<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DefaultUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if any user exists, if not create default user
        if (User::count() === 0) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@monitoring.com',
                'password' => Hash::make('admin123'),
                'status' => 'active',
                'role' => 'user',
            ]);
            
            $this->command->info('Default user created:');
            $this->command->info('Email: admin@monitoring.com');
            $this->command->info('Password: admin123');
        } else {
            $this->command->info('Users already exist, skipping default user creation.');
        }
    }
}
