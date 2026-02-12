<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            /*
            |------------------------------------------------------------------
            | 1) Fetch existing staff (seeded by other seeders / manual entry)
            |------------------------------------------------------------------
            */
            $staffIds = DB::table('staff')
                ->where('work_status', 'active')
                ->pluck('staff_id')
                ->all();

            if (empty($staffIds)) {
                $this->command->warn('No active staff found — skipping schedule/booking seeding.');
                return;
            }

            /*
            |------------------------------------------------------------------
            | 2) SCHEDULE — 90 days of shifts (Mon-Sat, 10:00-19:00)
            |    → makes most calendar dates available
            |------------------------------------------------------------------
            */
            $today = now()->startOfDay();

            for ($d = 0; $d < 90; $d++) {
                $date = $today->copy()->addDays($d);

                // Skip Sundays
                if ($date->isSunday()) {
                    continue;
                }

                foreach ($staffIds as $staffId) {
                    DB::table('schedule')->updateOrInsert(
                        ['staff_id' => $staffId, 'schedule_date' => $date->toDateString()],
                        [
                            'start_time'      => '10:00',
                            'end_time'        => '19:00',
                            'status'          => 'active',
                            'approval_status' => 'approved',
                            'created_at'      => now(),
                            'updated_at'      => now(),
                        ]
                    );
                }
            }

            /*
            |------------------------------------------------------------------
            | 3) Grab customers & services
            |------------------------------------------------------------------
            */
            $customers = DB::table('customers')
                ->select('customer_id', 'name', 'email', 'phone', 'is_uitm_member')
                ->get();

            if ($customers->isEmpty()) {
                $this->command->warn('No customers found — skipping booking seeding.');
                return;
            }

            $services = DB::table('service')->select('id', 'name', 'price', 'duration_minutes')->get();
            if ($services->isEmpty()) {
                $this->command->warn('No services found — skipping booking seeding.');
                return;
            }

            /*
            |------------------------------------------------------------------
            | 4) BOOKINGS — 3 per customer with different statuses & dates
            |------------------------------------------------------------------
            | Each booking:  slot (booked) → booking → booking_participant
            */
            $bookingTemplates = [
                // completed booking (7 days ago)
                ['dayOffset' => -7, 'status' => 'completed', 'payment_status' => 'paid', 'payment_method' => 'stripe'],
                // confirmed upcoming booking (+3 days)
                ['dayOffset' => 3, 'status' => 'confirmed',  'payment_status' => 'paid', 'payment_method' => 'qr'],
                // pending upcoming booking (+10 days)
                ['dayOffset' => 10, 'status' => 'pending',   'payment_status' => 'unpaid', 'payment_method' => null],
            ];

            $slotTimes = ['10:00', '11:30', '14:00', '15:30', '17:00'];
            $slotIdx = 0;

            foreach ($customers as $cust) {
                $isUitm = !empty($cust->is_uitm_member);

                foreach ($bookingTemplates as $tpl) {
                    $date = $today->copy()->addDays($tpl['dayOffset']);
                    if ($date->isSunday()) {
                        $date->addDay(); // shift to Monday
                    }

                    // Pick a service (rotate through list)
                    $service = $services[$slotIdx % $services->count()];
                    $duration = (int) $service->duration_minutes;
                    $startTime = $slotTimes[$slotIdx % count($slotTimes)];
                    $endTime = date('H:i', strtotime("$startTime:00") + $duration * 60);
                    $staffId = $staffIds[$slotIdx % count($staffIds)];

                    // --- Slot ---
                    $slotId = 'SL' . strtoupper(Str::random(10));

                    // Avoid unique constraint collision (service_id + slot_date + start_time)
                    $exists = DB::table('slot')
                        ->where('service_id', $service->id)
                        ->where('slot_date', $date->toDateString())
                        ->where('start_time', $startTime)
                        ->exists();

                    if ($exists) {
                        // Shift start time by 30 min
                        $startTime = date('H:i', strtotime("$startTime:00") + 30 * 60);
                        $endTime = date('H:i', strtotime("$startTime:00") + $duration * 60);
                    }

                    $slotRow = [
                        'slot_id'    => $slotId,
                        'service_id' => $service->id,
                        'staff_id'   => $staffId,
                        'slot_date'  => $date->toDateString(),
                        'start_time' => $startTime,
                        'end_time'   => $endTime,
                        'status'     => 'booked',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    if (Schema::hasColumn('slot', 'room_id')) {
                        $slotRow['room_id'] = null;
                    }

                    DB::table('slot')->insert($slotRow);

                    // --- Booking ---
                    $price    = (float) $service->price;
                    $discount = $isUitm ? round($price * 0.10, 2) : 0.00;
                    $final    = round($price - $discount, 2);
                    $deposit  = round($final * 0.30, 2);

                    $bookingId = 'BK' . strtoupper(Str::random(8));

                    DB::table('booking')->insert([
                        'booking_id'     => $bookingId,
                        'customer_id'    => $cust->customer_id,
                        'slot_id'        => $slotId,
                        'total_amount'   => $price,
                        'discount_amount'=> $discount,
                        'final_amount'   => $final,
                        'deposit_amount' => $deposit,
                        'status'         => $tpl['status'],
                        'payment_method' => $tpl['payment_method'],
                        'payment_status' => $tpl['payment_status'],
                        'created_at'     => now(),
                        'updated_at'     => now(),
                    ]);

                    // --- Participant (self) ---
                    if (Schema::hasTable('booking_participant')) {
                        DB::table('booking_participant')->insert([
                            'booking_id'     => $bookingId,
                            'is_self'        => true,
                            'name'           => $cust->name,
                            'phone'          => $cust->phone ?? '',
                            'email'          => $cust->email,
                            'is_uitm_member' => $isUitm,
                            'discount_amount'=> $discount,
                            'created_at'     => now(),
                            'updated_at'     => now(),
                        ]);
                    }

                    $slotIdx++;
                }
            }

            $this->command->info('BookingSeeder: schedules (90 days), slots & bookings created.');
        });
    }
}
