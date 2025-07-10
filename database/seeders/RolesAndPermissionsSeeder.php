<?php
// File ini tidak digunakan lagi karena aplikasi sudah tidak menggunakan MySQL/XAMPP.

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Membuat role 'admin' jika belum ada
        Role::firstOrCreate(['name' => 'admin']);

        // Membuat role 'user' jika belum ada
        Role::firstOrCreate(['name' => 'user']);
    }
}

