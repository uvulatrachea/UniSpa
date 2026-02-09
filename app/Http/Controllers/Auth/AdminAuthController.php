<?php

namespace App\Http\Controllers\Auth;

use App\Models\Staff;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    public function create()
    {
        return inertia('Auth/AdminLogin');
    }

    public function store(Request $request)
    {
        $email = mb_strtolower(trim((string) $request->input('email', '')));
        $request->merge(['email' => $email]);

        $credentials = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $staff = Staff::where('email', $credentials['email'])->first();
        if (!$staff) {
            throw ValidationException::withMessages([
                'email' => 'Invalid email or password.',
            ]);
        }

        $plainPassword = (string) $credentials['password'];
        $passwordOk = false;

        try {
            $passwordOk = Hash::check($plainPassword, (string) $staff->password);
        } catch (RuntimeException $e) {
            // Legacy or malformed hash in DB (e.g. plain text): avoid 500.
            if ((string) $staff->password === $plainPassword) {
                $passwordOk = true;
                $staff->password = Hash::make($plainPassword);
                $staff->save();
            }
        }

        if (!$passwordOk) {
            throw ValidationException::withMessages([
                'email' => 'Invalid email or password.',
            ]);
        }

        Auth::guard('staff')->login($staff, $request->boolean('remember'));

        $request->session()->regenerate();

        $staff = Auth::guard('staff')->user();
        if (($staff->role ?? null) !== 'Admin' || ($staff->work_status ?? 'active') !== 'active') {
            Auth::guard('staff')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'Invalid email or password.',
            ]);
        }

        if (!empty($staff->password) && Hash::needsRehash((string) $staff->password)) {
            $staff->password = Hash::make((string) $request->input('password'));
            $staff->save();
        }

        return redirect()->route('admin.dashboard');
    }

    public function destroy(Request $request)
    {
        Auth::guard('staff')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
