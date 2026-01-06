<?php

namespace App\Services;

use App\Models\OtpVerification;
use App\Models\Customer;
use App\Mail\SendOtpEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class OtpService
{
    // OTP validity in minutes
    private const OTP_VALIDITY = 10;

    // Max failed attempts
    private const MAX_ATTEMPTS = 5;

    /**
     * Generate a 6-digit OTP
     */
    public function generateOtp(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Send OTP for signup (UITM only)
     */
    public function sendOtpForSignup(string $email, string $name, string $phone = null): bool
    {
        try {
            // Check if customer already exists
            if (Customer::where('email', $email)->exists()) {
                return false;
            }

            $otp = $this->generateOtp();
            $expiresAt = Carbon::now()->addMinutes(self::OTP_VALIDITY);

            // Store OTP or update existing
            OtpVerification::updateOrCreate(
                ['email' => $email, 'type' => 'signup'],
                [
                    'otp_token' => Hash::make($otp),
                    'expires_at' => $expiresAt,
                    'attempts' => 0,
                    'signup_data' => [
                        'name' => $name,
                        'phone' => $phone,
                    ],
                ]
            );

            // Send OTP email
            Mail::to($email)->send(new SendOtpEmail($otp, 'signup'));

            return true;
        } catch (\Exception $e) {
            \Log::error('OTP Signup Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(string $email, string $otp): array
    {
        $otpRecord = OtpVerification::where('email', $email)
            ->where('type', 'signup')
            ->first();

        if (!$otpRecord) {
            return [
                'success' => false,
                'message' => 'No OTP sent to this email.',
            ];
        }

        if (Carbon::now()->isAfter($otpRecord->expires_at)) {
            $otpRecord->delete();
            return [
                'success' => false,
                'message' => 'OTP has expired.',
            ];
        }

        if ($otpRecord->attempts >= self::MAX_ATTEMPTS) {
            $otpRecord->delete();
            return [
                'success' => false,
                'message' => 'Too many failed attempts. Request a new OTP.',
            ];
        }

        if (!Hash::check($otp, $otpRecord->otp_token)) {
            $otpRecord->increment('attempts');
            return [
                'success' => false,
                'message' => 'Invalid OTP.',
                'attempts' => $otpRecord->attempts,
            ];
        }

        return [
            'success' => true,
            'signup_data' => $otpRecord->signup_data ?? [],
        ];
    }

    /**
     * Invalidate OTP after successful verification
     */
    public function invalidateOtp(string $email): void
    {
        OtpVerification::where('email', $email)
            ->where('type', 'signup')
            ->delete();
    }

    /**
     * Cleanup expired OTPs
     */
    public function cleanupExpiredOtps(): void
    {
        OtpVerification::where('expires_at', '<', Carbon::now())->delete();
    }
}
