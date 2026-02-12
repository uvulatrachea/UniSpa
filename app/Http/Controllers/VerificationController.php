<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\verification;
use App\Models\Customer;
use App\Services\OtpService;
use Illuminate\Support\Facades\Auth;

class VerificationController extends Controller
{
    protected $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Show the OTP verification page
     */
    public function showVerifyOtp(Request $request)
    {
        $email = $request->query('email');
        
        if (!$email) {
            return redirect()->route('customer.login')->with('error', 'Email is required for verification.');
        }

        // Check if customer exists
        $customer = Customer::where('email', $email)->first();
        if (!$customer) {
            return redirect()->route('customer.login')->with('error', 'Customer not found.');
        }

        return view('auth.verify-otp', compact('email'));
    }

    /**
     * Handle OTP verification
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:customers,email',
            'otp' => 'required|string|size:6',
        ]);

        $result = $this->otpService->verifyOtp($request->email, $request->otp);

        if ($result['success']) {
            // Mark customer as email verified
            $customer = Customer::where('email', $request->email)->first();
            $customer->is_email_verified = true;
            $customer->save();

            // Invalidate the OTP
            $this->otpService->invalidateOtp($request->email);

            return redirect()->route('customer.dashboard')->with('success', 'Email verified successfully!');
        } else {
            return back()->with('error', $result['message']);
        }
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:customers,email',
        ]);

        $customer = Customer::where('email', $request->email)->first();
        
        if ($customer->is_email_verified) {
            return back()->with('error', 'Email is already verified.');
        }

        $success = $this->otpService->sendOtpForVerification($request->email, $customer->name, $customer->phone);

        if ($success) {
            return back()->with('success', 'OTP sent successfully to your email.');
        } else {
            return back()->with('error', 'Failed to send OTP. Please try again.');
        }
    }

    /**
     * Check verification status
     */
    public function checkStatus(Request $request)
    {
        if (!Auth::guard('customer')->check()) {
            return response()->json([
                'verified' => false,
                'message' => 'Customer not authenticated'
            ]);
        }

        $customer = Auth::guard('customer')->user();
        
        return response()->json([
            'verified' => $customer->is_email_verified,
            'email' => $customer->email,
            'message' => $customer->is_email_verified ? 'Email is verified' : 'Email is not verified'
        ]);
    }
}
