<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class RegisteredCustomerController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:customers,email'],
            'phone' => ['required','string','max:20'],
            'cust_type' => ['required','in:regular,uitm_member'],
            'member_type' => ['nullable','in:student,staff'],
            'is_uitm_member' => ['required'],
            'password' => ['required','confirmed', Password::min(8)],
        ]);

        $email = strtolower(trim($validated['email']));

        $isUitmStudent = str_ends_with($email, '@student.uitm.edu.my');
        $isUitmStaff   = str_ends_with($email, '@staff.uitm.edu.my');
        $isUitmEmail   = $isUitmStudent || $isUitmStaff;

        // Validate UITM vs regular
        if ($validated['cust_type'] === 'uitm_member' && !$isUitmEmail) {
            throw ValidationException::withMessages([
                'email' => 'UITM registration requires @student.uitm.edu.my or @staff.uitm.edu.my email.',
            ]);
        }

        if ($validated['cust_type'] === 'regular' && $isUitmEmail) {
            throw ValidationException::withMessages([
                'email' => 'UITM email must register as UITM Member.',
            ]);
        }

        // If UITM, member_type is required
        $memberType = null;
        if ($validated['cust_type'] === 'uitm_member') {
            if (empty($validated['member_type'])) {
                throw ValidationException::withMessages([
                    'member_type' => 'Please select member type (student/staff).',
                ]);
            }
            $memberType = $validated['member_type'];
        }

        $customer = Customer::create([
            'name' => $validated['name'],
            'email' => $email,
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),

            // ✅ stored for discount logic later
            'cust_type' => $validated['cust_type'],                       // regular / uitm_member
            'is_uitm_member' => $validated['cust_type'] === 'uitm_member',
            'member_type' => $memberType,

            // for now mark verified (OTP KIV)
            'verification_status' => 'verified',
            'email_verified_at' => now(),
        ]);

        // If you want user to be logged in immediately after register:
        Auth::guard('customer')->login($customer);

        return redirect()->route('customer.dashboard');
    }
}
