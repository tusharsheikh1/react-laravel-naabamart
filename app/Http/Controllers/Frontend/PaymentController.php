<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function success(Request $request)
    {
        $tran_id = $request->input('tran_id');
        $val_id = $request->input('val_id');
        
        // Find the order using the unique transaction ID
        $order = Order::where('transaction_id', $tran_id)->first();

        if (!$order || $order->payment_status !== 'pending') {
            return redirect()->route('cart.index')->with('error', 'Invalid Transaction or Order already processed.');
        }

        // CRITICAL SECURITY FIX: Validate the transaction with SSLCommerz servers
        $isValid = $this->validateTransaction($val_id, $order->total_amount, 'BDT');

        if ($isValid) {
            // Update the order status to paid
            $order->update([
                'payment_status' => 'paid',
            ]);

            // Append to edit history for tracking
            $history = $order->edit_history ?? [];
            $history[] = [
                'action' => "Payment successful via SSLCommerz (Tran ID: {$tran_id}, Val ID: {$val_id})",
                'user'   => 'System API',
                'time'   => now()->toISOString(),
            ];
            $order->update(['edit_history' => $history]);

            // Redirect to the Inertia success page
            return redirect()->route('checkout.success', $order->id)->with('success', 'Payment Successful!');
        }

        // If validation fails, mark as failed
        $order->update(['payment_status' => 'failed']);
        return redirect()->route('cart.index')->with('error', 'Payment validation failed. Please contact support.');
    }

    public function fail(Request $request)
    {
        $tran_id = $request->input('tran_id');
        $order = Order::where('transaction_id', $tran_id)->first();

        if ($order && $order->payment_status === 'pending') {
            $order->update(['payment_status' => 'failed']);
        }

        return redirect()->route('cart.index')->with('error', 'Payment Failed. Please try again.');
    }

    public function cancel(Request $request)
    {
        $tran_id = $request->input('tran_id');
        $order = Order::where('transaction_id', $tran_id)->first();

        if ($order && $order->payment_status === 'pending') {
            $order->update(['payment_status' => 'failed']); // Or 'cancelled' if you add that status
        }

        return redirect()->route('cart.index')->with('error', 'Payment was cancelled.');
    }

    public function ipn(Request $request)
    {
        // IPN is a background API call from SSLCommerz. 
        // It ensures the payment is recorded even if the user closes their browser early.
        $tran_id = $request->input('tran_id');
        $val_id = $request->input('val_id');
        $status = $request->input('status'); // e.g., VALID, FAILED, CANCELLED

        $order = Order::where('transaction_id', $tran_id)->first();

        if ($order && $order->payment_status === 'pending') {
            if ($status === 'VALID' || $status === 'VALIDATED') {
                // Validate IPN calls as well to prevent spoofing
                $isValid = $this->validateTransaction($val_id, $order->total_amount, 'BDT');
                if ($isValid) {
                    $order->update(['payment_status' => 'paid']);
                }
            } elseif (in_array($status, ['FAILED', 'CANCELLED'])) {
                $order->update(['payment_status' => 'failed']);
            }
        }

        return response()->json(['message' => 'IPN Processed']);
    }

    /**
     * Helper method to call the SSLCommerz Validation API
     */
    private function validateTransaction($val_id, $expectedAmount, $expectedCurrency)
    {
        if (!$val_id) {
            return false;
        }

        $apiUrl = env('SSLCZ_TESTMODE', true) ? 
            "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php" : 
            "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php";

        try {
            $response = Http::get($apiUrl, [
                'val_id' => $val_id,
                'store_id' => env('STORE_ID'),
                'store_passwd' => env('STORE_PASSWORD'),
                'v' => 1,
                'format' => 'json'
            ]);

            $result = $response->json();

            if (isset($result['status']) && ($result['status'] === 'VALID' || $result['status'] === 'VALIDATED')) {
                // Ensure the amount and currency match your database to prevent price tampering
                if ($result['amount'] >= $expectedAmount && $result['currency'] === $expectedCurrency) {
                    return true;
                }
            }
        } catch (\Exception $e) {
            Log::error('SSLCommerz Validation API Error: ' . $e->getMessage());
        }

        return false;
    }
}