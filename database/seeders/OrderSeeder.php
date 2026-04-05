<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\User;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::where('role', 'customer')->first();

        // Order 1: Pending Order (Cash on Delivery)
        Order::create([
            'user_id' => $customer ? $customer->id : null,
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'customer_name' => 'Test Customer',
            'customer_phone' => '01711000000',
            'shipping_area' => 'Inside Dhaka',
            'total_amount' => 45000.00,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'order_status' => 'pending',
            'shipping_address' => '123 Test Street, Dhaka',
            'notes' => 'Please deliver in the evening.',
        ]);

        // Order 2: Shipped Order (Testing Steadfast Courier fields)
        Order::create([
            'user_id' => $customer ? $customer->id : null,
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'customer_name' => 'Jane Doe',
            'customer_phone' => '01811000000',
            'shipping_area' => 'Outside Dhaka',
            'total_amount' => 1000.00, // Price after discount for the book
            'payment_method' => 'bkash',
            'payment_status' => 'paid',
            'order_status' => 'shipped',
            'shipping_address' => '456 Remote Area, Chittagong',
            'consignment_id' => 'STDFST-987654321',
            'tracking_code' => 'TRK-987654321',
            'courier_status' => 'in_transit',
        ]);
    }
}