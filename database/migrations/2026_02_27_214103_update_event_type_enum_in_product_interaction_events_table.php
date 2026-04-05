<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Safely alter the ENUM to include 'purchase' WHILE keeping original values
        DB::statement("ALTER TABLE product_interaction_events MODIFY COLUMN event_type ENUM('view', 'add_to_cart', 'remove_from_cart', 'wishlist', 'compare', 'scroll', 'heatmap_click', 'purchase') NOT NULL");
    }

    public function down()
    {
        // Revert back to the exact original list
        DB::statement("ALTER TABLE product_interaction_events MODIFY COLUMN event_type ENUM('view', 'add_to_cart', 'remove_from_cart', 'wishlist', 'compare', 'scroll', 'heatmap_click') NOT NULL");
    }
};