<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Requests\Auth\SignupRequest;
use App\Models\Customer;
use App\Services\OtpService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
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
        // Match SDD (PDF): customer login is email + password (same UI as register, toggle panel).
        return Inertia::render('Auth/Auth', [
            'defaultPanel' => 'login',
            'status' => session('status'),
            'canResetPassword' => true,
        ]);
    }

    /**
     * Show customer signup page
     */
    public function showSignup(): Response
    {
        // Match SDD (PDF): customer signup is username/email/phone/password + UITM type selection.
        return Inertia::render('Auth/Auth', [
            'defaultPanel' => 'register',
            'status' => session('status'),
            'canResetPassword' => true,
        ]);
    }

    /**
     * Customer password-based login (session guard: customer)
     */
    public function passwordLogin(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember');

        if (!Auth::guard('customer')->attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('customer.dashboard'));
    }

    /**
     * Customer password-based registration
     */
    public function passwordRegister(Request $request): RedirectResponse
    {
        // NOTE: Customer model uses table `customers`. Some older code used `customer`.
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:customers,email'],
            'phone' => ['required', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'cust_type' => ['required', 'string', 'in:uitm_member,regular'],
            'member_type' => ['nullable', 'string', 'in:student,staff'],
            'is_uitm_member' => ['nullable'],
        ];

        if ($request->input('cust_type') === 'uitm_member') {
            $rules['member_type'] = ['required', 'string', 'in:student,staff'];
        }

        $validated = $request->validate($rules);

        // Determine is_uitm_member from selection + email domain
        $emailLower = strtolower($validated['email']);
        $emailIsUitm = str_ends_with($emailLower, '@student.uitm.edu.my') || str_ends_with($emailLower, '@staff.uitm.edu.my');

        if ($validated['cust_type'] === 'uitm_member' && !$emailIsUitm) {
            throw ValidationException::withMessages([
                'email' => ['The email must be a valid UITM email (@student.uitm.edu.my or @staff.uitm.edu.my).'],
            ]);
        }

        if ($validated['cust_type'] === 'regular' && $emailIsUitm) {
            throw ValidationException::withMessages([
                'email' => ['UITM email addresses cannot be used for regular registration.'],
            ]);
        }

        $customer = Customer::create([
            'customer_id' => 'CUST-' . Str::uuid(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'is_uitm_member' => $emailIsUitm,
            'verification_status' => $emailIsUitm ? 'pending' : 'verified',
            'cust_type' => $validated['cust_type'],
            'member_type' => $validated['cust_type'] === 'uitm_member' ? $validated['member_type'] : null,
            'is_email_verified' => !$emailIsUitm,
            'auth_method' => 'password',
            'profile_completed' => true,
        ]);

        if ($emailIsUitm) {
            $this->otpService->sendOtpForSignup($customer->email, $customer->name, $customer->phone);
            return redirect()->route('verify.otp.page', ['email' => $customer->email])
                ->with('success', 'OTP has been sent to your UITM email.');
        }

        Auth::guard('customer')->login($customer);
        $request->session()->regenerate();

        return redirect()->route('customer.dashboard');
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
            'email' => 'required|email|exists:customers,email',
            'otp_code' => 'required|digits:6',
        ]);

        $otpService = $this->otpService;
        $result = $otpService->verifyOtp($request->email, $request->otp_code);

        if (!$result['success']) {
            return back()->withErrors(['otp_code' => $result['message']]);
        }

        // Update customer verification status
        $customer = Customer::where('email', $request->email)->first();
        $customer->verification_status = 'verified';
        $customer->is_email_verified = true;
        $customer->save();

        $otpService->invalidateOtp($request->email);

        return redirect()->route('customer.login')->with('success', 'Email verified! You can now log in.');
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

        request()->session()->invalidate();
        request()->session()->regenerateToken();

        // Inertia-friendly redirect
        return redirect()->route('customer.login');
    }
}
