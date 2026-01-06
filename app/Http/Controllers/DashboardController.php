<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Add your actual data fetching here
        $customerCount = \App\Models\Customer::count();
        $bookingCount = \App\Models\Booking::count();
        $serviceCount = \App\Models\Service::count();
        $staffCount = \App\Models\Staff::count();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalCustomers' => $customerCount,
                'totalBookings' => $bookingCount,
                'totalServices' => $serviceCount,
                'totalStaff' => $staffCount,
            ]
        ]);
    }
}