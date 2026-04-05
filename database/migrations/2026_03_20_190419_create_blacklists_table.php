<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('blacklists', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'ip', 'device_fingerprint', or 'phone'
            $table->string('value');
            $table->string('reason')->nullable();
            $table->timestamps();
            
            // Ensure we don't duplicate blocks
            $table->unique(['type', 'value']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('blacklists');
    }
};