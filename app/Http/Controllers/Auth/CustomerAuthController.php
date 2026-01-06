<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Requests\Auth\SignupRequest;
use App\Models\Customer;
use App\Services\OtpService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomerAuthController extends Controller
{
    private OtpService $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Show customer login page
     */
    public function showLogin(): Response
    {
        return Inertia::render('Auth/CustomerLogin');
    }

    /**
     * Show customer signup page
     */
    public function showSignup(): Response
    {
        return Inertia::render('Auth/CustomerSignup');
    }

    /**
     * Send OTP for login
     */
    public function sendLoginOtp(SendOtpRequest $request)
    {
        $email = $request->validated()['email'];

        // Check if customer exists
        if (!Customer::where('email', $email)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'This email is not registered. Please sign up first.'
            ], 404);
        }

        // Send OTP
        $sent = $this->otpService->sendOtpForLogin($email);

        if ($sent) {
            return response()->json([
                'success' => true,
                'message' => 'OTP has been sent to your email',
                'email' => $email
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to send OTP. Please try again.'
        ], 500);
    }

    /**
     * Verify OTP and login customer
     */
    public function verifyLoginOtp(VerifyOtpRequest $request)
    {
        $validated = $request->validated();
        $email = $validated['email'];
        $otp = $validated['otp'];

        // Verify OTP
        $result = $this->otpService->verifyOtp($email, $otp);

        if (!$result['success']) {
            $status = isset($result['attempts']) && $result['attempts'] >= 5 ? 429 : 400;
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'attempts' => $result['attempts'] ?? null
            ], $status);
        }

        // Get customer
        $customer = Customer::where('email', $email)->firstOrFail();

        // Mark email as verified
        $customer->update([
            'is_email_verified' => true
        ]);

        // Invalidate OTP
        $this->otpService->invalidateOtp($email);

        // Create session/auth token
        auth('customer')->login($customer);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'customer' => $customer
        ]);
    }

    /**
     * Send OTP for signup
     */
    public function sendSignupOtp(SendOtpRequest $request)
    {
        $email = $request->validated()['email'];

        // Check if email already registered
        if (Customer::where('email', $email)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'This email is already registered'
            ], 409);
        }

        // Send OTP
        $sent = $this->otpService->sendOtpForSignup($email);

        if ($sent) {
            return response()->json([
                'success' => true,
                'message' => 'OTP has been sent to your email',
                'email' => $email
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to send OTP. Please try again.'
        ], 500);
    }

    /**
     * Verify OTP and create account (email signup)
     */
    public function verifySignupOtp(VerifyOtpRequest $request)
    {
        $validated = $request->validated();
        $email = $validated['email'];
        $otp = $validated['otp'];

        // Verify OTP
        $result = $this->otpService->verifyOtp($email, $otp);

        if (!$result['success']) {
            $status = isset($result['attempts']) && $result['attempts'] >= 5 ? 429 : 400;
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'attempts' => $result['attempts'] ?? null
            ], $status);
        }

        // OTP verified - return success to proceed to password creation
        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully',
            'signup_data' => $result['signup_data'] ?? null
        ]);
    }

    /**
     * Complete signup by creating password and account
     */
    public function completeEmailSignup(SignupRequest $request)
    {
        $validated = $request->validated();
        $email = $validated['email'];
        $otp = $validated['otp'];

        // Re-verify OTP (security check)
        $otpResult = $this->otpService->verifyOtp($email, $otp);
        
        if (!$otpResult['success']) {
            return response()->json([
                'success' => false,
                'message' => 'OTP verification failed'
            ], 400);
        }

        // Check if email already exists (double check)
        if (Customer::where('email', $email)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'This email is already registered'
            ], 409);
        }

        // Create customer
        try {
            $customer = Customer::create([
                'customer_id' => 'CUST-' . Str::uuid(),
                'name' => $validated['name'],
                'email' => $email,
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'],
                'is_email_verified' => true,
                'auth_method' => 'email',
                'profile_completed' => true,
                'is_uitm_member' => false,
                'verification_status' => 'unverified',
            ]);

            // Invalidate OTP
            $this->otpService->invalidateOtp($email);

            // Log in the customer
            auth('customer')->login($customer);

            return response()->json([
                'success' => true,
                'message' => 'Account created successfully',
                'customer' => $customer
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Signup Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create account. Please try again.'
            ], 500);
        }
    }

        public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:customer,email',
            'otp_code' => 'required|digits:6',
        ]);

        $otpService = new OtpService();
        $result = $otpService->verifyOtp($request->email, $request->otp_code);

        if (!$result['success']) {
            return back()->withErrors(['otp_code' => $result['message']]);
        }

        // Update customer verification status
        $customer = Customer::where('email', $request->email)->first();
        $customer->verification_status = 'verified';
        $customer->save();

        $otpService->invalidateOtp($request->email);

        return redirect()->route('login')->with('success', 'Email verified! You can now log in.');
    }


    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = \Socialite::driver('google')->user();

            // Find or create customer
            $customer = Customer::where('google_id', $googleUser->getId())->first();

            if (!$customer) {
                // Check if email exists with different auth method
                $existingEmail = Customer::where('email', $googleUser->getEmail())->first();

                if ($existingEmail) {
                    // Link Google ID to existing account (optional)
                    $existingEmail->update([
                        'google_id' => $googleUser->getId(),
                        'auth_method' => 'google'
                    ]);
                    $customer = $existingEmail;
                } else {
                    // Create new customer
                    $customer = Customer::create([
                        'customer_id' => 'CUST-' . Str::uuid(),
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'google_id' => $googleUser->getId(),
                        'is_email_verified' => true,
                        'auth_method' => 'google',
                        'profile_completed' => false,
                        'is_uitm_member' => false,
                        'verification_status' => 'unverified',
                    ]);
                }
            }

            // Log in customer
            auth('customer')->login($customer);

            // Redirect to dashboard or profile completion
            return redirect('/dashboard');
        } catch (\Exception $e) {
            \Log::error('Google Auth Error: ' . $e->getMessage());
            return redirect('/customer/login')->with('error', 'Google sign-in failed');
        }
    }

    /**
     * Redirect to Google
     */
    public function redirectToGoogle()
    {
        return \Socialite::driver('google')->redirect();
    }

    /**
     * Logout customer
     */
    public function logout()
    {
        auth('customer')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}
