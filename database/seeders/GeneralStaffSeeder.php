<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class GeneralStaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $staff = [
            [
                'name' => 'Nur Izzati',
                'email' => 'izzati@gmail.com',
                'phone' => '0121111113',
                'password' => Hash::make('Password!1'),
                'staff_type' => 'general',
                'role' => 'Admin',
                'work_status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Hasya Rashid',
                'email' => 'hasya@gmail.com',
                'phone' => '0193000012',
                'password' => Hash::make('Password!1'),
                'staff_type' => 'therapist',
                'role' => 'Therapist',
                'work_status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Aziqah Abu',
                'email' => 'aziqah@student.uitm.edu.my',
                'phone' => '0182000026',
                'password' => Hash::make('Password!1'),
                'staff_type' => 'student',
                'role' => 'Student Therapist',
                'work_status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        foreach ($staff as $s) {
            DB::table('staff')->updateOrInsert(
                ['email' => $s['email']],
                $s
            );
        }
    }
}
