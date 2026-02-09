<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        // 1) Categories
        $categories = DB::table('service_category as c')
            ->leftJoin('service as s', 's.category_id', '=', 'c.id')
            ->select(
                'c.id',
                'c.name',
                'c.gender',
                DB::raw('COUNT(s.id) as services_count')
            )
            ->groupBy('c.id', 'c.name', 'c.gender')
            ->orderBy('c.name')
            ->get();

        // 2) Services + review stats
        $services = DB::table('service as sv')
            ->join('service_category as sc', 'sc.id', '=', 'sv.category_id')
            ->leftJoin('slot as sl', 'sl.service_id', '=', 'sv.id')
            ->leftJoin('booking as b', 'b.slot_id', '=', 'sl.slot_id')
            ->leftJoin('review as r', 'r.booking_id', '=', 'b.booking_id')
            ->select(
                'sv.id as service_id',
                'sv.id',
                'sv.name',
                'sv.description',
                'sv.price',
                'sv.duration_minutes',
                'sv.image_url',
                'sv.is_popular',

                // ✅ cast json -> text so Postgres can group
                DB::raw("COALESCE(sv.tags::text, '[]') as tags"),

                'sv.category_id',
                'sc.name as category_name',

                DB::raw('COALESCE(AVG(r.rating), 0) as avg_rating'),
                DB::raw('COUNT(r.review_id) as review_count')
            )
            ->groupBy(
                'sv.id',
                'sv.name',
                'sv.description',
                'sv.price',
                'sv.duration_minutes',
                'sv.image_url',
                'sv.is_popular',
                DB::raw("sv.tags::text"),   // ✅ must match select cast
                'sv.category_id',
                'sc.name'
            )
            ->orderBy('sv.name')
            ->get();

        return Inertia::render('Booking/Services', [
            'services' => $services,
            'categories' => $categories,
        ]);
    }
}
