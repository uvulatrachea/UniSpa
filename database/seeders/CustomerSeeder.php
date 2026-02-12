<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    /**
     * Seed customers: one regular user and one UiTM member.
     * Can be run alone: php artisan db:seed --class=CustomerSeeder
     */
    public function run(): void
    {
        $customers = [
            [
                'name' => 'Nur Aina',
                'email' => '2025179327@student.uitm.edu.my',
                'phone' => '0131000001',
                'password' => Hash::make('Password!1'),
                'cust_type' => 'uitm_member',
                'member_type' => 'student',
                'is_uitm_member' => true,
                'verification_status' => 'verified',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Adam Lee',
                'email' => 'adam@gmail.com',
                'phone' => '0132000001',
                'password' => Hash::make('Password!1'),
                'cust_type' => 'regular',
                'member_type' => null,
                'is_uitm_member' => false,
                'verification_status' => 'verified',
                'email_verified_at' => now(),
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
    }
}
