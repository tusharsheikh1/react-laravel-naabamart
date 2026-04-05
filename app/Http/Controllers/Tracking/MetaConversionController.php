<?php

namespace App\Http\Controllers\Tracking;

use App\Http\Controllers\Controller;
use App\Models\MetaEventLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MetaConversionController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate incoming data
        $validated = $request->validate([
            'event_name'  => 'required|string',
            'event_id'    => 'nullable|string',
            'event_time'  => 'nullable|integer',
            'event_url'   => 'required|url',
            'user_data'   => 'nullable|array',
            'custom_data' => 'nullable|array',
        ]);

        // ✅ FIX 1: Use the event_id sent by the frontend browser pixel.
        // This MUST match the eventID passed to fbq() so Meta can deduplicate
        // the browser pixel fire and this CAPI call — counting the event only once.
        // If somehow missing, generate a fallback (though frontend should always send it).
        $eventId = !empty($validated['event_id'])
            ? $validated['event_id']
            : 'evt_' . Str::random(16);

        // 2. Prepare User Data (Meta requires SHA-256 hashing for all PII fields)
        $userData = $validated['user_data'] ?? [];

        // Hash Email
        if (!empty($userData['em'])) {
            $userData['em'] = hash('sha256', strtolower(trim($userData['em'])));
        }

        // Hash Phone — normalise to E.164 format for Bangladesh before hashing
        if (!empty($userData['ph'])) {
            $phone = preg_replace('/[^0-9]/', '', $userData['ph']);

            // Bangladesh numbers: 11 digits starting with 01 → prepend country code 88
            if (strlen($phone) === 11 && str_starts_with($phone, '01')) {
                $phone = '88' . $phone;
            }

            $userData['ph'] = hash('sha256', $phone);
        }

        // Hash First Name
        if (!empty($userData['fn'])) {
            $userData['fn'] = hash('sha256', strtolower(trim($userData['fn'])));
        }

        // Hash Last Name
        if (!empty($userData['ln'])) {
            $userData['ln'] = hash('sha256', strtolower(trim($userData['ln'])));
        }

        // Always attach server-side signals — these strengthen match quality
        $userData['client_ip_address'] = $request->ip();
        $userData['client_user_agent'] = $request->userAgent();

        // 3. Log to database before firing, so we always have a record
        $log = MetaEventLog::create([
            'event_name'  => $validated['event_name'],
            'event_id'    => $eventId,
            'user_data'   => $userData,
            'custom_data' => $validated['custom_data'] ?? [],
            'status'      => 'processing',
        ]);

        // 4. Prepare the Meta Conversions API payload
        $pixelId = config('services.meta.pixel_id');
        $token   = config('services.meta.access_token');

        $payload = [
            'data' => [
                [
                    'event_name'       => $validated['event_name'],
                    'event_time'       => $validated['event_time'] ?? time(),
                    'event_id'         => $eventId,          // ✅ matches browser pixel eventID
                    'event_source_url' => $validated['event_url'],
                    'action_source'    => 'website',
                    'user_data'        => $userData,
                    'custom_data'      => !empty($validated['custom_data'])
                                            ? $validated['custom_data']
                                            : (object)[],   // empty object, not empty array
                ],
            ],
        ];

        // ✅ FIX 2: Use config() not env() — env() breaks when config cache is active
        $testCode = config('services.meta.test_event_code');
        if (!empty($testCode)) {
            $payload['test_event_code'] = $testCode;
        }

        // 5. Send to Meta Graph API
        // ✅ FIX 3: Updated from v19.0 to v21.0 (v19.0 is deprecated)
        $response = Http::timeout(10)
            ->post("https://graph.facebook.com/v21.0/{$pixelId}/events?access_token={$token}", $payload);

        // 6. Update the log with the result
        $log->update([
            'status'       => $response->successful() ? 'success' : 'failed',
            'api_response' => $response->json(),
        ]);

        if ($response->failed()) {
            return response()->json([
                'error'   => 'Failed to send to Meta Conversions API',
                'details' => $response->json(),
            ], 400);
        }

        return response()->json([
            'message'  => 'Event tracked successfully',
            'event_id' => $eventId,
        ]);
    }
}