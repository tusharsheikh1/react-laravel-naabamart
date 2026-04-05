<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\Setting;

class SmsService
{
    protected $settings;
    protected $apiUrl;
    protected $apiKey;
    protected $senderId;

    public function __construct()
    {
        // Fetch cached settings and save them to a property so we can access templates later
        $this->settings = Cache::rememberForever('app_settings', function () {
            try {
                return Setting::pluck('value', 'key')->toArray();
            } catch (\Exception $e) {
                return [];
            }
        });

        // Map the settings to class properties
        $this->apiUrl = $this->settings['sms_bulksmsbd_url'] ?? 'http://bulksmsbd.net/api';
        $this->apiKey = $this->settings['sms_bulksmsbd_api_key'] ?? '';
        $this->senderId = $this->settings['sms_bulksmsbd_sender_id'] ?? '';
    }

    /**
     * Send a raw SMS message.
     */
    public function sendSms($number, $message)
    {
        // Prevent sending if API key is missing from settings
        if (empty($this->apiKey) || empty($this->senderId)) {
            Log::error('SMS failed: API Key or Sender ID is missing in settings.');
            return ['success' => false, 'message' => 'SMS Gateway is not configured.'];
        }

        try {
            $response = Http::get("{$this->apiUrl}/smsapi", [
                'api_key'  => $this->apiKey,
                'senderid' => $this->senderId,
                'type'     => 'text',
                'number'   => $number,
                'message'  => $message,
            ]);

            $result = $response->json();

            if (isset($result['response_code']) && $result['response_code'] == 202) {
                return ['success' => true, 'message' => 'SMS sent successfully', 'data' => $result];
            }

            Log::error('BulkSMSBD Error: ', ['response' => $result]);
            return ['success' => false, 'message' => $this->getErrorMessage($result['response_code'] ?? 'Unknown')];

        } catch (\Exception $e) {
            Log::error('BulkSMSBD Exception: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to connect to SMS Gateway.'];
        }
    }

    /**
     * Fetch a template from Settings, replace dynamic placeholders, and send.
     */
    public function sendTemplatedSms($number, $templateKey, $defaultTemplate, $replacements = [])
    {
        // Fail safely if gateway isn't set
        if (empty($this->apiKey) || empty($this->senderId)) {
            return ['success' => false, 'message' => 'SMS Gateway is not configured.'];
        }

        // --- NEW: Check if explicitly disabled via frontend toggle switch ---
        $toggleKey = str_replace('sms_template_', 'sms_notify_', $templateKey);
        
        // If the toggle setting exists and is '0', do not send the SMS
        if (isset($this->settings[$toggleKey]) && $this->settings[$toggleKey] === '0') {
            return ['success' => true, 'message' => "SMS ({$toggleKey}) is disabled by admin."];
        }

        // Get template from database settings, or fallback to the provided default
        $template = $this->settings[$templateKey] ?? $defaultTemplate;

        // If the admin deliberately leaves the template blank in the dashboard, disable it.
        if (trim($template) === '') {
            return ['success' => true, 'message' => 'SMS notification disabled by empty template.'];
        }

        // Replace placeholders (e.g., {name} -> 'John Doe')
        $message = str_replace(array_keys($replacements), array_values($replacements), $template);

        return $this->sendSms($number, $message);
    }

    public function sendOtp($number, $otp, $companyName = 'YourCompany')
    {
        $message = "Your {$companyName} OTP is {$otp}";
        return $this->sendSms($number, $message);
    }

    private function getErrorMessage($code)
    {
        $errors = [
            1001 => 'Invalid Number',
            1002 => 'Sender ID not correct / Sender ID is disabled',
            1005 => 'Internal Error',
            1007 => 'Balance Insufficient',
        ];

        return $errors[$code] ?? "Unknown Error (Code: {$code})";
    }
}