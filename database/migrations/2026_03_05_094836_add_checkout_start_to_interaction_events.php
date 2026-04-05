<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update the ENUM string to include all your previous values PLUS 'checkout_start'
        DB::statement("ALTER TABLE product_interaction_events MODIFY COLUMN event_type ENUM('view', 'add_to_cart', 'remove_from_cart', 'purchase', 'cancel_purchase', 'scroll', 'checkout_start') NOT NULL");
    }

    public function down(): void
    {
        // Revert back if needed (removes checkout_start)
        DB::statement("ALTER TABLE product_interaction_events MODIFY COLUMN event_type ENUM('view', 'add_to_cart', 'remove_from_cart', 'purchase', 'cancel_purchase', 'scroll') NOT NULL");
    }
};