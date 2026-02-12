<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class CustomerSignupController extends Controller
{
    protected $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
        $this->middleware('guest');
    }

    /**
     * Send OTP for customer signup
     * Step 1: User enters email, name, phone and customer type
     * If UITM: Send OTP to @uitm.edu.my email
     * If Non-UITM: Skip OTP, proceed to password creation
     */
    public function sendOtp(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|unique:customer,email',
                'name' => 'required|string|max:255',
                'phone' => 'required|string|min:10',
                'customer_type' => 'required|in:uitm,non-uitm',
            ]);

            $email = $validated['email'];
            $name = $validated['name'];
            $customerType = $validated['customer_type'];

            // Check if email domain matches customer type
            $isUitmEmail = $this->otpService->isUitmEmail($email);

            if ($customerType === 'uitm' && !$isUitmEmail) {
                return response()->json([
                    'success' => false,
                    'message' => 'For UITM members, please use your @uitm.edu.my email address.',
                ], 400);
            }

            // For Non-UITM customers, no OTP needed
            if ($customerType === 'non-uitm') {
                return response()->json([
                    'success' => true,
                    'message' => 'Proceed to password creation',
                    'requires_otp' => false,
                    'customer_type' => 'non-uitm',
                ]);
            }

            // For UITM: Generate and send OTP
            $result = $this->otpService->generateAndSendOtp($email, $name, 'signup');

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'requires_otp' => true,
                'customer_type' => 'uitm',
                'otp_expiry_minutes' => OtpService::OTP_EXPIRY_MINUTES,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Send OTP Error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred. Please try again.',
            ], 500);
        }
    }

    /**
     * Verify OTP for UITM customers
     * Step 2: User enters OTP sent to email
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'otp' => 'required|string|size:6',
            ]);

            $result = $this->otpService->verifyOtp($validated['email'], $validated['otp']);

            if (!$result['success']) {
                return response()->json($result, 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Email verified! Now create your password.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Verify OTP Error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred. Please try again.',
            ], 500);
        }
    }

    /**
     * Resend OTP for UITM customers
     */
    public function resendOtp(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'name' => 'required|string',
            ]);

            $result = $this->otpService->resendOtp($validated['email'], $validated['name']);

            if (!$result['success']) {
                return response()->json($result, 422);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Resend OTP Error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred. Please try again.',
            ], 500);
        }
    }

    /**
     * Complete signup - Create account
     * Step 3: User sets password and completes signup
     * ALL customers must verify email at /verify-otp AFTER account creation
     */
    public function completeSignup(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|unique:customer,email',
                'name' => 'required|string|max:255',
                'phone' => 'required|string|min:10',
                'password' => 'required|min:8|confirmed',
                'customer_type' => 'required|in:uitm,non-uitm',
                'otp' => 'required_if:customer_type,uitm|nullable|string',
            ]);

            // If UITM, verify that OTP was verified
            if ($validated['customer_type'] === 'uitm') {
                $otpRecord = \App\Models\OtpVerification::where('email', $validated['email'])
                    ->where('is_verified', true)
                    ->where('type', 'signup')
                    ->first();

                if (!$otpRecord) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email verification required. Please verify your OTP.',
                    ], 422);
                }
            }

            // Create customer account (NOT verified yet - will be verified at /verify-otp)
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'is_uitm_member' => $validated['customer_type'] === 'uitm',
                'verification_status' => 'pending',
                'cust_type' => $validated['customer_type'] === 'uitm' ? 'uitm_student' : 'regular',
                'email_verified_at' => null,
            ]);

            // Clean up OTP record if UITM
            if ($validated['customer_type'] === 'uitm') {
                \App\Models\OtpVerification::where('email', $validated['email'])
                    ->where('type', 'signup')
                    ->delete();
            }

            // Send OTP for email verification (for Non-UITM and to re-send for UITM)
            try {
                $this->otpService->sendOtpForVerification($user->email, $user->name, $user->phone);
            } catch (\Throwable $e) {
                Log::warning('OTP send failed during signup: ' . $e->getMessage());
            }

            // Redirect to OTP verification page - DO NOT auto-login
            return response()->json([
                'success' => true,
                'message' => 'Account created! Please verify your email.',
                'redirect' => '/verify-otp?email=' . urlencode($validated['email']),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Complete Signup Error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Signup failed. Please try again.',
            ], 500);
        }
    }
}
