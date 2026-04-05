<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // 1. Sanitize existing data: Convert any role that isn't 'admin' into 'user'
        // This prevents MySQL from throwing the "Data truncated" error.
        DB::table('users')
            ->whereNotIn('role', ['admin'])
            ->update(['role' => 'user']);

        // 2. Safely apply the new ENUM structure
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'staff', 'user') NOT NULL DEFAULT 'user'");
    }

    public function down()
    {
        // Revert to old enum structure if rolled back
        DB::table('users')
            ->whereNotIn('role', ['admin', 'user'])
            ->update(['role' => 'user']);

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'user') NOT NULL DEFAULT 'user'");
    }
};