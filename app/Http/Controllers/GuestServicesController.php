<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class GuestServicesController extends Controller
{
    public function index()
    {
        // IMPORTANT:
        // This project has had multiple schema versions:
        // - Some dumps/migrations use service.id (default Laravel)
        // - Some older code assumed service.service_id
        // To avoid breaking /guest/services, detect the PK column safely.
        $servicePk = Schema::hasColumn('service', 'service_id') ? 'service_id' : 'id';
        $categoryPk = Schema::hasColumn('service_category', 'category_id') ? 'category_id' : 'id';

        // ✅ services (table: service)
        $services = DB::table('service')
            ->select([
                DB::raw("{$servicePk} as id"),
                DB::raw("{$servicePk} as service_id"),
                'category_id',
                'name',
                'description',
                'price',
                'duration_minutes',
                'image_url',
                'is_popular',
            ])
            ->orderByDesc('is_popular')
            ->orderBy($servicePk)
            ->get();

        // ✅ categories (table: service_category)
        $categorySelect = [
            DB::raw("{$categoryPk} as id"),
            DB::raw("{$categoryPk} as category_id"),
            'name',
        ];

        foreach (['gender', 'description', 'icon', 'sort_order', 'is_active'] as $col) {
            if (Schema::hasColumn('service_category', $col)) {
                $categorySelect[] = $col;
            }
        }

        $categoriesQuery = DB::table('service_category')->select($categorySelect);

        if (Schema::hasColumn('service_category', 'is_active')) {
            $categoriesQuery->where('is_active', true);
        }

        if (Schema::hasColumn('service_category', 'sort_order')) {
            $categoriesQuery->orderBy('sort_order');
        }

        $categories = $categoriesQuery->orderBy('name')->get();

        return Inertia::render('Guest/GuestServices', [
            'services' => $services,
            'categories' => $categories,
        ]);
    }
}
