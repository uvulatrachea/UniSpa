<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call(GeneralStaffSeeder::class);

        // Admin, customers (regular + UiTM), categories, services, promotions
        $this->call(UniSpaSeeder::class);

        // Ensure customer accounts exist (regular + UiTM) – safe to run after UniSpaSeeder (upserts by email)
        $this->call(CustomerSeeder::class);

        // Treatment rooms (2 per service category)
        $this->call(TreatmentRoomSeeder::class);

        // Schedules (90 days Mon-Sat), slots & bookings for every customer
        $this->call(BookingSeeder::class);
    }
}
