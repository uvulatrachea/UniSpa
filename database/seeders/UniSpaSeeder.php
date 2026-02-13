<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UniSpaSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            /**
             * A0) Admin staff account (secure hashed password)
             */
            $adminEmail = env('ADMIN_EMAIL', 'dinihasya15@gmail.com');
            $adminPasswordHash = Hash::make(env('ADMIN_PASSWORD', 'Admin12345!'));

            // migrate old admin login if it exists
            DB::table('staff')
                ->where('email', 'izzati@gmail.com')
                ->update([
                    'name' => 'Nur Izzati',
                    'email' => $adminEmail,
                    'phone' => '0121111113',
                    'password' => $adminPasswordHash,
                    'staff_type' => 'general',
                    'role' => 'Admin',
                    'work_status' => 'active',
                    'created_at' => now(),
                ]);

            DB::table('staff')->updateOrInsert(
                ['email' => $adminEmail],
                [
                    'name' => 'Nur Izzati',
                    'phone' => '0121111113',
                    'password' => $adminPasswordHash,
                    'staff_type' => 'general',
                    'role' => 'Admin',
                    'work_status' => 'active',
                    'created_at' => now(),
                ]
            );

            $adminStaffId = DB::table('staff')->where('email', $adminEmail)->value('staff_id');
            if ($adminStaffId) {
                DB::table('general_staff')->updateOrInsert(
                    ['staff_id' => $adminStaffId],
                    ['staff_id' => $adminStaffId]
                );
            }

            /**
             * Staff Seeder — creates example active staff (general, therapist, student)
             */


            /**
             * A) Customers (safe upsert) – one UiTM member, one regular user
             */
            $customers = [
                [ // UiTM member (student)
                    'name' => 'Nur Aina',
                    'email' => '2025179327@student.uitm.edu.my',
                    'phone' => '0131000001',
                    'password' => Hash::make('Password!1'),
                    'cust_type' => 'uitm_member',
                    'member_type' => 'student',
                    'is_uitm_member' => true,
                    'verification_status' => 'verified',
                    'email_verified_at' => now(),
                    'is_email_verified' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [ // Regular user
                    'name' => 'Adam Lee',
                    'email' => 'adam@gmail.com',
                    'phone' => '0132000001',
                    'password' => Hash::make('Password!1'),
                    'cust_type' => 'regular',
                    'member_type' => null,
                    'is_uitm_member' => false,
                    'verification_status' => 'verified',
                    'email_verified_at' => now(),
                    'is_email_verified' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ];

            foreach ($customers as $c) {
                DB::table('customers')->updateOrInsert(
                    ['email' => $c['email']],
                    $c
                );
            }

            /**
             * B) Service Categories (ONLY columns that exist in your DB)
             * - service_category PK = id
             * - columns you likely have: id, name, gender, created_at, updated_at
             */
            $categories = [
                ['name' => 'Barber & Hair Spa (Men)',         'gender' => 'male',   'capacity_units' => 1],
                ['name' => 'Facial Treatments',               'gender' => 'female', 'capacity_units' => 1],
                ['name' => 'Makeup Session',                  'gender' => 'female', 'capacity_units' => 1],
                ['name' => 'Massage Therapy Session',         'gender' => 'unisex', 'capacity_units' => 1],
                ['name' => 'Muslimah Hair Cut & Spa (Women)', 'gender' => 'female', 'capacity_units' => 1],
                ['name' => 'Nail & Foot Care',                'gender' => 'female', 'capacity_units' => 1],
            ];

            foreach ($categories as $cat) {
                DB::table('service_category')->updateOrInsert(
                    ['name' => $cat['name']],
                    [
                        'gender' => $cat['gender'],
                        'capacity_units' => $cat['capacity_units'],
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }
            // Map category name -> id
            $categoryMap = DB::table('service_category')
                ->select('id', 'name')
                ->whereIn('name', collect($categories)->pluck('name')->all())
                ->get()
                ->pluck('id', 'name');

            /**
             * C) Services (service PK = id, FK category_id -> service_category.id)
             * - only insert columns that exist in your service table
             */
            $services = [
                // Facial
                ['category' => 'Facial Treatments', 'name' => 'Signature Normal Facial', 'description' => 'Basic facial treatment', 'price' => 50.00, 'duration_minutes' => 30, 'is_popular' => false],
                ['category' => 'Facial Treatments', 'name' => 'Deep Cleansing Facial', 'description' => 'Cleanses deep impurities', 'price' => 100.00, 'duration_minutes' => 60, 'is_popular' => false],
                ['category' => 'Facial Treatments', 'name' => 'Anti-Aging Facial', 'description' => 'Normal price: RM150.00 | New price: RM99.00', 'price' => 99.00, 'duration_minutes' => 90, 'is_popular' => true],

                // Massage
                ['category' => 'Massage Therapy Session', 'name' => 'Aromatherapy Massage (60 mins)', 'description' => 'Relaxing aroma oil massage', 'price' => 120.00, 'duration_minutes' => 60, 'is_popular' => true],
                ['category' => 'Massage Therapy Session', 'name' => 'Foot Reflexology (30 mins)', 'description' => 'Soothes tired feet', 'price' => 60.00, 'duration_minutes' => 30, 'is_popular' => false],

                // Nail
                ['category' => 'Nail & Foot Care', 'name' => 'Classic Manicure', 'description' => 'A basic nail care treatment', 'price' => 55.00, 'duration_minutes' => 45, 'is_popular' => false],
                ['category' => 'Nail & Foot Care', 'name' => 'Spa Pedicure', 'description' => 'A luxurious foot care treatment', 'price' => 40.00, 'duration_minutes' => 60, 'is_popular' => false],
            ];

            foreach ($services as $s) {
                $categoryId = $categoryMap[$s['category']] ?? null;
                if (!$categoryId) {
                    continue;
                }

                DB::table('service')->updateOrInsert(
                    ['category_id' => $categoryId, 'name' => $s['name']],
                    [
                        'category_id' => $categoryId,
                        'name' => $s['name'],
                        'description' => $s['description'],
                        'price' => $s['price'],
                        'duration_minutes' => $s['duration_minutes'],
                        'image_url' => null,
                        'is_popular' => (bool) $s['is_popular'],
                        // your DB shows tags is json (nullable) — store empty array
                        'tags' => json_encode([]),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }

            /**
             * D) Promotions (table name = promotion)
             */
            $promotions = [
                [
                    'title' => 'Complete Wellness Package',
                    'description' => 'Experience our signature treatments designed for total relaxation and rejuvenation.',
                    'banner_image' => 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80',
                    'link' => '/services',
                    'discount_type' => 'percentage',
                    'discount_value' => 50,
                    'start_date' => now()->toDateString(),
                    'end_date' => null,
                    'is_active' => true,
                ],
                [
                    'title' => 'Student Special Offer',
                    'description' => 'Exclusive discounts for UiTM students. Show your student ID for extra benefits.',
                    'banner_image' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80',
                    'link' => '/appointment/appointment-i',
                    'discount_type' => 'percentage',
                    'discount_value' => 30,
                    'start_date' => now()->toDateString(),
                    'end_date' => null,
                    'is_active' => true,
                ],
                [
                    'title' => 'First Time Customer',
                    'description' => 'Special welcome package for new customers. Experience Uni-Spa quality.',
                    'banner_image' => 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
                    'link' => '/appointment/appointment-i',
                    'discount_type' => 'percentage',
                    'discount_value' => 25,
                    'start_date' => now()->toDateString(),
                    'end_date' => null,
                    'is_active' => true,
                ],
            ];

            foreach ($promotions as $p) {
                DB::table('promotion')->updateOrInsert(
                    ['title' => $p['title']],
                    array_merge($p, [
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])
                );
            }
        });
    }
}
