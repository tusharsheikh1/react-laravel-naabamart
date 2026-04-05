<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\CheckLowStockLevels;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ==========================================
// Scheduled Analytics & Inventory Jobs
// ==========================================

// 1. Change this to everyMinute() for real-time dashboard updates
Schedule::command('analytics:calculate-daily')->everyMinute();

// 2. Predictions don't need to be every minute, hourly is good
Schedule::command('analytics:generate-intelligence')->hourly();

// 3. Check for low stock and send admin alerts
Schedule::job(new CheckLowStockLevels)->dailyAt('08:00');