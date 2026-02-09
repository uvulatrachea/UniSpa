<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegisteredCustomerController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:customers,email'],
            'phone' => ['required', 'string', 'max:30'],
            'cust_type' => ['required', 'in:regular,uitm_member'],
            'member_type' => ['nullable', 'in:student,staff'],
            'is_uitm_member' => ['required', 'boolean'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $email = strtolower(trim($validated['email']));
        $custType = $validated['cust_type'];
        $memberType = $validated['member_type'] ?? null;

        // Detect UITM email
        $isStudentMail = str_ends_with($email, '@student.uitm.edu.my');
        $isStaffMail   = str_ends_with($email, '@staff.uitm.edu.my');
        $isUitmEmail   = $isStudentMail || $isStaffMail;

        // Enforce rules
        if ($custType === 'uitm_member') {
            if (!$memberType) {
                throw ValidationException::withMessages([
                    'member_type' => 'Please select Student or Staff.',
                ]);
            }

            if ($memberType === 'student' && !$isStudentMail) {
                throw ValidationException::withMessages([
                    'email' => 'UITM students must use @student.uitm.edu.my email.',
                ]);
            }

            if ($memberType === 'staff' && !$isStaffMail) {
                throw ValidationException::withMessages([
                    'email' => 'UITM staff must use @staff.uitm.edu.my email.',
                ]);
            }
        }

        if ($custType === 'regular' && $isUitmEmail) {
            throw ValidationException::withMessages([
                'email' => 'UITM email must register as UITM Member.',
            ]);
        }

        // Force is_uitm_member to match cust_type
        $isUitmMember = $custType === 'uitm_member';

        // For now: mark verified immediately (you said OTP/Google KIV first)
        $customer = Customer::create([
            'name' => $validated['name'],
            'email' => $email,
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'cust_type' => $custType,
            'is_uitm_member' => $isUitmMember,
            'member_type' => $isUitmMember ? $memberType : null,
            'verification_status' => $isUitmMember ? 'verified' : 'verified',
            'email_verified_at' => now(),
        ]);

        Auth::guard('customer')->login($customer);
        $request->session()->regenerate();

        return redirect()->route('customer.dashboard');
    }
}
