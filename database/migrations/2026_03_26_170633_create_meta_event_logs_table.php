<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meta_event_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_name');
            $table->string('event_id')->nullable();
            $table->json('user_data')->nullable();
            $table->json('custom_data')->nullable();
            $table->string('status')->default('pending'); // pending, success, failed
            $table->json('api_response')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meta_event_logs');
    }
};