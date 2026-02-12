<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerProfileController extends Controller
{
    public function show()
    {
        $customer = auth('customer')->user();

        // Quick stats for the sidebar
        $totalCustomers = DB::table('customers')->count();

        $studentStaff = 0;
        $generalStaff = 0;
        if (\Illuminate\Support\Facades\Schema::hasTable('staff')) {
            $studentStaff = DB::table('staff')
                ->where('staff_type', 'student')
                ->where('work_status', 'active')
                ->count();
            $generalStaff = DB::table('staff')
                ->where('staff_type', '!=', 'student')
                ->where('work_status', 'active')
                ->count();
        }

        $avgRating = 0;
        if (\Illuminate\Support\Facades\Schema::hasTable('review')) {
            $avgRating = DB::table('review')->avg('rating') ?? 0;
        }

        return Inertia::render('Profile', [
            'stats' => [
                'totalCustomers' => $totalCustomers,
                'studentStaff'   => $studentStaff,
                'generalStaff'   => $generalStaff,
                'avgRating'      => round((float) $avgRating, 1),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $customer = auth('customer')->user();

        $data = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $customer->update($data);

        return response()->json(['ok' => true, 'message' => 'Profile updated successfully.']);
    }
}
