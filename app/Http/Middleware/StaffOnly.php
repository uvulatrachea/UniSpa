<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class StaffOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('staff')->user();

        if (!$user) {
            return redirect()->route('staff.login');
        }

        // Exclude Admin accounts (admins have their own portal).
        if (($user->role ?? null) === 'Admin' || ($user->work_status ?? 'active') !== 'active') {
            Auth::guard('staff')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route('staff.login');
        }

        return $next($request);
    }
}
