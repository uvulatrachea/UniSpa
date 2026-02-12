<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
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

        // 2) Services + review stats (tags cast for GROUP BY: MySQL CAST, Postgres ::text)
        $isMysql = DB::connection()->getDriverName() === 'mysql';
        $tagsSelect = $isMysql
            ? DB::raw("COALESCE(CAST(sv.tags AS CHAR), '[]') as tags")
            : DB::raw("COALESCE(sv.tags::text, '[]') as tags");
        $tagsGroupBy = $isMysql
            ? DB::raw('CAST(sv.tags AS CHAR)')
            : DB::raw('sv.tags::text');

        $hasReviewBookingId = Schema::hasColumn('review', 'booking_id');

        $servicesQuery = DB::table('service as sv')
            ->join('service_category as sc', 'sc.id', '=', 'sv.category_id')
            ->leftJoin('slot as sl', 'sl.service_id', '=', 'sv.id')
            ->leftJoin('booking as b', 'b.slot_id', '=', 'sl.slot_id');

        if ($hasReviewBookingId) {
            $servicesQuery->leftJoin('review as r', 'r.booking_id', '=', 'b.booking_id');
        }

        $services = $servicesQuery
            ->select(
                'sv.id as service_id',
                'sv.id',
                'sv.name',
                'sv.description',
                'sv.price',
                'sv.duration_minutes',
                'sv.image_url',
                'sv.is_popular',
                $tagsSelect,
                'sv.category_id',
                'sc.name as category_name',
                $hasReviewBookingId
                    ? DB::raw('COALESCE(AVG(r.rating), 0) as avg_rating')
                    : DB::raw('0 as avg_rating'),
                $hasReviewBookingId
                    ? DB::raw('COUNT(r.review_id) as review_count')
                    : DB::raw('0 as review_count')
            )
            ->groupBy(
                'sv.id',
                'sv.name',
                'sv.description',
                'sv.price',
                'sv.duration_minutes',
                'sv.image_url',
                'sv.is_popular',
                $tagsGroupBy,
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

    public function show(int $id)
    {
        $hasReviewBookingId = Schema::hasColumn('review', 'booking_id');

        $serviceQuery = DB::table('service as sv')
            ->join('service_category as sc', 'sc.id', '=', 'sv.category_id')
            ->leftJoin('slot as sl', 'sl.service_id', '=', 'sv.id')
            ->leftJoin('booking as b', 'b.slot_id', '=', 'sl.slot_id');

        if ($hasReviewBookingId) {
            $serviceQuery->leftJoin('review as r', 'r.booking_id', '=', 'b.booking_id');
        }

        $service = $serviceQuery
            ->where('sv.id', $id)
            ->select(
                'sv.id as service_id',
                'sv.id',
                'sv.name',
                'sv.description',
                'sv.price',
                'sv.duration_minutes',
                'sv.image_url',
                'sv.is_popular',
                'sv.category_id',
                'sc.name as category_name',
                $hasReviewBookingId
                    ? DB::raw('COALESCE(AVG(r.rating), 0) as avg_rating')
                    : DB::raw('0 as avg_rating'),
                $hasReviewBookingId
                    ? DB::raw('COUNT(r.review_id) as review_count')
                    : DB::raw('0 as review_count')
            )
            ->groupBy(
                'sv.id',
                'sv.name',
                'sv.description',
                'sv.price',
                'sv.duration_minutes',
                'sv.image_url',
                'sv.is_popular',
                'sv.category_id',
                'sc.name'
            )
            ->first();

        if (!$service) {
            abort(404);
        }

        // Get recent reviews for this service
        $reviews = collect();
        if ($hasReviewBookingId) {
            $reviews = DB::table('review as r')
                ->join('booking as b', 'b.booking_id', '=', 'r.booking_id')
                ->join('slot as sl', 'sl.slot_id', '=', 'b.slot_id')
                ->leftJoin('customers as c', 'c.customer_id', '=', DB::raw(
                    Schema::hasColumn('review', 'customer_id') ? 'r.customer_id' : 'b.customer_id'
                ))
                ->where('sl.service_id', $id)
                ->select(
                    'r.rating',
                    Schema::hasColumn('review', 'comment') ? 'r.comment' : DB::raw('NULL as comment'),
                    'r.created_at',
                    'c.name as customer_name'
                )
                ->orderByDesc('r.created_at')
                ->limit(10)
                ->get();
        }

        // Related services in the same category
        $related = DB::table('service as sv')
            ->where('sv.category_id', $service->category_id)
            ->where('sv.id', '!=', $id)
            ->select('sv.id as service_id', 'sv.name', 'sv.price', 'sv.duration_minutes', 'sv.image_url')
            ->limit(4)
            ->get();

        return Inertia::render('Booking/ServiceDetail', [
            'service' => $service,
            'reviews' => $reviews,
            'related' => $related,
        ]);
    }
}
