<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Admin User
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin', // Required by AdminMiddleware
            ]
        );

        // 2. Create Staff User
        User::updateOrCreate(
            ['email' => 'staff@gmail.com'],
            [
                'name' => 'Store Manager',
                'password' => Hash::make('password'),
                'role' => 'staff', // Supported by AdminOrStaffMiddleware
            ]
        );

        // 3. Create a Default Customer
        User::updateOrCreate(
            ['email' => 'customer@gmail.com'],
            [
                'name' => 'Test Customer',
                'password' => Hash::make('password'),
                'role' => 'customer',
            ]
        );
    }
}