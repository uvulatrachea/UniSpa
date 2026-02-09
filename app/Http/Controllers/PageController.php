<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * Show Promotions page
     */
    public function promotions(): Response
    {
        // Use default promotional offers since promotions table may not exist
        $promotions = collect([
            [
                'promotion_id' => 1,
                'title' => "Complete Wellness Package",
                'description' => "Experience our signature treatments designed for total relaxation and rejuvenation.",
                'discount_type' => 'percentage',
                'discount_value' => 50,
                'banner_image' => "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80",
                'start_date' => null,
                'end_date' => null,
                'is_active' => true,
                'services' => []
            ],
            [
                'promotion_id' => 2,
                'title' => "Student Special Offer",
                'description' => "Exclusive discounts for UiTM students. Show your student ID for extra benefits.",
                'discount_type' => 'percentage',
                'discount_value' => 30,
                'banner_image' => "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80",
                'start_date' => null,
                'end_date' => null,
                'is_active' => true,
                'services' => []
            ],
            [
                'promotion_id' => 3,
                'title' => "First Time Customer",
                'description' => "Special welcome package for new customers. Experience Uni-Spa quality.",
                'discount_type' => 'percentage',
                'discount_value' => 25,
                'banner_image' => "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80",
                'start_date' => null,
                'end_date' => null,
                'is_active' => true,
                'services' => []
            ],
            [
                'promotion_id' => 4,
                'title' => "Weekend Relaxation Deal",
                'description' => "Special weekend rates for all our premium services.",
                'discount_type' => 'fixed',
                'discount_value' => 20,
                'banner_image' => "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80",
                'start_date' => null,
                'end_date' => null,
                'is_active' => true,
                'services' => []
            ],
            [
                'promotion_id' => 5,
                'title' => "Loyalty Member Discount",
                'description' => "Returning customers get 15% off on all services.",
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'banner_image' => "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=1600&q=80",
                'start_date' => null,
                'end_date' => null,
                'is_active' => true,
                'services' => []
            ]
        ]);

        return Inertia::render('Promotions', [
            'promotions' => $promotions,
            'stats' => [
                'totalStaff' => \App\Models\Staff::count(),
                'generalStaff' => \App\Models\Staff::where('staff_type', 'general')->count(),
                'studentStaff' => \App\Models\Staff::where('staff_type', 'student')->count(),
                'avgRating' => 4.5, // Default rating since reviews table may not exist
                'totalServices' => \App\Models\Service::count(),
                'totalCustomers' => \App\Models\Customer::count(),
                'completedBookings' => \App\Models\Booking::where('status', 'completed')->count(),
                'totalBookings' => \App\Models\Booking::count(),
            ]
        ]);
    }

    /**
     * Show Contact Us page
     */
    public function contact(): Response
    {
        return Inertia::render('Contact', [
            'stats' => [
                'totalStaff' => \App\Models\Staff::count(),
                'generalStaff' => \App\Models\Staff::where('staff_type', 'general')->count(),
                'studentStaff' => \App\Models\Staff::where('staff_type', 'student')->count(),
                'avgRating' => 4.5,
                'totalServices' => \App\Models\Service::count(),
                'totalCustomers' => \App\Models\Customer::count(),
                'completedBookings' => \App\Models\Booking::where('status', 'completed')->count(),
                'totalBookings' => \App\Models\Booking::count(),
            ]
        ]);
    }

    /**
     * Show About Us page
     */
    public function about(): Response
    {
        return Inertia::render('About', [
            'stats' => [
                'totalStaff' => \App\Models\Staff::count(),
                'generalStaff' => \App\Models\Staff::where('staff_type', 'general')->count(),
                'studentStaff' => \App\Models\Staff::where('staff_type', 'student')->count(),
                'avgRating' => 4.5,
                'totalServices' => \App\Models\Service::count(),
                'totalCustomers' => \App\Models\Customer::count(),
                'completedBookings' => \App\Models\Booking::where('status', 'completed')->count(),
                'totalBookings' => \App\Models\Booking::count(),
            ]
        ]);
    }
}
