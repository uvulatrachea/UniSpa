<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\OtpService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    protected OtpService $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        // Base validation rules
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:customer,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'required|string|max:20',
            // Updated to accept frontend values 'uitm_member' and 'regular'
            'cust_type' => 'required|string|in:uitm_member,regular',
            'member_type' => 'required_if:cust_type,uitm_member|string|in:student,staff',
        ];

        // Add conditional validation for UITM emails
        if ($request->input('cust_type') === 'uitm_member') {
            $rules['email'][] = function ($attribute, $value, $fail) use ($request) {
                $memberType = $request->input('member_type', 'student');
                $emailLower = strtolower($value);
                
                if ($memberType === 'student' && !str_ends_with($emailLower, '@student.uitm.edu.my')) {
                    $fail('UITM students must use @student.uitm.edu.my email address.');
                }
                
                if ($memberType === 'staff' && !str_ends_with($emailLower, '@staff.uitm.edu.my')) {
                    $fail('UITM staff must use @staff.uitm.edu.my email address.');
                }
            };
        }

        // Validate request
        $request->validate($rules);

        // Determine if UITM member based on email domain
        $isUitmMember = false;
        $emailLower = strtolower($request->email);
        
        if (str_ends_with($emailLower, '@student.uitm.edu.my') || 
            str_ends_with($emailLower, '@staff.uitm.edu.my')) {
            $isUitmMember = true;
        }

        // Additional validation: ensure UITM selection matches email domain
        if ($request->cust_type === 'uitm_member' && !$isUitmMember) {
            throw ValidationException::withMessages([
                'email' => ['The email must be a valid UITM email (@student.uitm.edu.my or @staff.uitm.edu.my) for UITM registration.'],
            ]);
        }

        if ($request->cust_type === 'regular' && $isUitmMember) {
            throw ValidationException::withMessages([
                'email' => ['UITM email addresses cannot be used for non-UITM registration. Please use a different email.'],
            ]);
        }

        // Create customer
        $customer = Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'is_uitm_member' => $isUitmMember ? 1 : 0, // Set based on email domain
            'verification_status' => $isUitmMember ? 'pending' : 'verified',
            'cust_type' => $request->cust_type,
            'member_type' => $request->member_type,
        ]);

        // If UITM, send OTP email
        if ($isUitmMember) {
            $this->otpService->sendOtpForSignup($customer->email, $customer->name);
            return redirect()->route('verify.otp.page', ['email' => $customer->email])
                ->with('success', 'OTP has been sent to your UITM email.');
        }

        // Non-UITM: log in immediately
        Auth::login($customer);
        event(new Registered($customer));

        return redirect()->route('dashboard');
    }
}