<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Service;
use App\Models\Slot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    private function servicePk(): string
    {
        // Support both schemas: service.id (new) or service.service_id (old SQL).
        return Schema::hasColumn('service', 'id') ? 'id' : 'service_id';
    }

    public function show()
    {
        $customerId = auth('customer')->user()->customer_id;

        $cart = Cart::where('customer_id', $customerId)->first();
        $items = $cart?->items ?? [];

        $serviceIds = collect($items)->pluck('service_id')->filter()->unique()->values()->all();

        $servicePk = $this->servicePk();
        $services = DB::table('service')
            ->whereIn($servicePk, $serviceIds)
            ->get()
            ->keyBy($servicePk);

        $cartItems = collect($items)->map(function ($it, $idx) use ($services) {
            $s = $services->get($it['service_id'] ?? null);

            return [
                'index' => $idx,
                'service_id' => (int)($it['service_id'] ?? 0),
                'pax' => (int)($it['quantity'] ?? $it['pax'] ?? 1),
                'slot_id' => $it['slot_id'] ?? null,
                'service' => $s ? [
                    // Frontend expects `service.id`
                    'id' => (int)($s->id ?? $s->service_id),
                    'name' => $s->name,
                    'price' => (float)$s->price,
                    'duration_minutes' => (int)$s->duration_minutes,
                    'image_url' => $s->image_url ?? null,
                    'category_id' => (int)($s->category_id ?? 0),
                ] : null,
            ];
        })->values();

        return Inertia::render('Booking/Schedule', [
            'cartItems' => $cartItems,
        ]);
    }

    // POST /booking/slots
    public function slots(Request $request)
    {
        $data = $request->validate([
            'service_id' => ['required','integer'],
            'date' => ['required','date'],
        ]);

        // NEW: slots are derived from (approved) staff schedule + room availability.
        // We return synthetic slot ids (TMP:...) and create the real slot row later
        // when payment is initiated (see PaymentController).

        $service = DB::table('service')->where('id', (int) $data['service_id'])->first();
        if (!$service) {
            return response()->json(['slots' => []]);
        }

        $duration = (int) ($service->duration_minutes ?? 60);
        $duration = max(15, min(240, $duration));

        $date = (string) $data['date'];
        $serviceCategoryId = property_exists($service, 'category_id') ? (int) $service->category_id : null;

        $hasApproval = Schema::hasTable('schedule') && Schema::hasColumn('schedule', 'approval_status');
        $hasRooms = Schema::hasTable('treatment_room');

        // Pull candidate staff for that date
        $staffIds = collect();
        if (Schema::hasTable('staff') && Schema::hasTable('schedule')) {
            $staffIds = DB::table('schedule as sc')
                ->join('staff as st', 'st.staff_id', '=', 'sc.staff_id')
                ->where('st.work_status', 'active')
                ->whereDate('sc.schedule_date', $date)
                ->where('sc.status', 'active')
                ->when($hasApproval, fn ($q) => $q->where('sc.approval_status', 'approved'))
                ->select('sc.staff_id')
                ->distinct()
                ->pluck('sc.staff_id');
        }

        if ($staffIds->isEmpty()) {
            return response()->json(['slots' => []]);
        }

        // Pull schedule rows for those staff on that date
        $scheduleRows = DB::table('schedule')
            ->whereIn('staff_id', $staffIds->all())
            ->whereDate('schedule_date', $date)
            ->where('status', 'active')
            ->when($hasApproval, fn ($q) => $q->where('approval_status', 'approved'))
            ->get(['staff_id', 'start_time', 'end_time']);

        // Existing occupied slots on that date (held/booked)
        $busySlots = Schema::hasTable('slot')
            ? DB::table('slot')
                ->whereDate('slot_date', $date)
                ->whereIn('status', ['held', 'booked'])
                ->get(['staff_id', Schema::hasColumn('slot', 'room_id') ? 'room_id' : DB::raw('NULL as room_id'), 'start_time', 'end_time'])
            : collect();

        // Rooms (optional: if no rooms, we still allow slots based on staff only)
        $rooms = collect();
        if ($hasRooms) {
            $rooms = DB::table('treatment_room')
                ->when(Schema::hasColumn('treatment_room', 'is_active'), fn ($q) => $q->where('is_active', true))
                ->when(Schema::hasColumn('treatment_room', 'status'), fn ($q) => $q->where('status', '!=', 'maintenance'))
                ->when(Schema::hasColumn('treatment_room', 'category_id') && $serviceCategoryId, fn ($q) => $q->where('category_id', $serviceCategoryId))
                ->orderBy('room_id')
                ->get([
                    'room_id',
                    Schema::hasColumn('treatment_room', 'status') ? 'status' : DB::raw("'available' as status"),
                    Schema::hasColumn('treatment_room', 'category_id') ? 'category_id' : DB::raw('NULL as category_id'),
                ]);
        }

        $officeStart = 10 * 60;
        $officeEnd = 19 * 60;
        $step = 30; // minutes

        $scheduleByStaff = $scheduleRows->groupBy('staff_id');
        $busyByStaff = $busySlots->whereNotNull('staff_id')->groupBy('staff_id');
        $busyByRoom = $busySlots->whereNotNull('room_id')->groupBy('room_id');

        $results = [];

        for ($t = $officeStart; $t + $duration <= $officeEnd; $t += $step) {
            $start = $this->minutesToTime($t);
            $end = $this->minutesToTime($t + $duration);

            // Find at least 1 available staff
            $hasAnyStaff = false;
            foreach ($staffIds as $staffId) {
                $ranges = $scheduleByStaff->get($staffId, collect());
                $onShift = $ranges->contains(function ($r) use ($t, $duration) {
                    $s = $this->timeToMinutes($r->start_time);
                    $e = $this->timeToMinutes($r->end_time);
                    return $t >= $s && ($t + $duration) <= $e;
                });
                if (!$onShift) continue;

                $conflicts = $busyByStaff->get($staffId, collect())->contains(function ($b) use ($t, $duration) {
                    $bs = $this->timeToMinutes($b->start_time);
                    $be = $this->timeToMinutes($b->end_time);
                    return $this->overlap($t, $t + $duration, $bs, $be);
                });
                if ($conflicts) continue;

                $hasAnyStaff = true;
                break;
            }

            if (!$hasAnyStaff) {
                continue;
            }

            // Find at least 1 available room (if we use rooms); otherwise allow slot with staff only
            if ($rooms->isNotEmpty()) {
                $hasAnyRoom = false;
                foreach ($rooms as $room) {
                    $conflicts = $busyByRoom->get($room->room_id, collect())->contains(function ($b) use ($t, $duration) {
                        $bs = $this->timeToMinutes($b->start_time);
                        $be = $this->timeToMinutes($b->end_time);
                        return $this->overlap($t, $t + $duration, $bs, $be);
                    });
                    if ($conflicts) continue;
                    $hasAnyRoom = true;
                    break;
                }
                if (!$hasAnyRoom) {
                    continue;
                }
            }

            $tmpId = 'TMP:' . (int) $data['service_id'] . ':' . $date . ':' . $start;
            $results[] = [
                'slot_id' => $tmpId,
                'slot_date' => $date,
                'start_time' => $start,
                'end_time' => $end,
                'status' => 'available',
            ];
        }

        return response()->json(['slots' => $results]);
    }

    // GET /booking/slots/month?service_id=3&month=2026-03-01
    public function monthAvailability(Request $request)
    {
        $data = $request->validate([
            'service_id' => ['required','integer'],
            'month' => ['required','date'], // first day of month
        ]);

        $start = date('Y-m-01', strtotime($data['month']));
        $end   = date('Y-m-t', strtotime($data['month']));

        // NEW: month availability is derived from approved schedules.
        // If there is at least 1 approved schedule on a day, the date is enabled.
        $hasApproval = Schema::hasTable('schedule') && Schema::hasColumn('schedule', 'approval_status');

        if (!Schema::hasTable('schedule') || !Schema::hasTable('staff')) {
            return response()->json(['dates' => []]);
        }

        $dates = DB::table('schedule as sc')
            ->join('staff as st', 'st.staff_id', '=', 'sc.staff_id')
            ->where('st.work_status', 'active')
            ->whereBetween('sc.schedule_date', [$start, $end])
            ->where('sc.status', 'active')
            ->when($hasApproval, fn ($q) => $q->where('sc.approval_status', 'approved'))
            ->selectRaw('sc.schedule_date')
            ->distinct()
            ->orderBy('sc.schedule_date')
            ->pluck('schedule_date')
            ->map(fn ($d) => (string) $d)
            ->values();

        return response()->json(['dates' => $dates]);
    }

    public function confirm(Request $request)
    {
        $data = $request->validate([
            'picks' => ['required','array','min:1'],
            'picks.*.index' => ['required','integer','min:0'],
            'picks.*.slot_id' => ['required','string'],
        ]);

        $customerId = auth('customer')->user()->customer_id;
        $cart = Cart::where('customer_id', $customerId)->firstOrFail();
        $items = $cart->items ?? [];

        // Save chosen slot_id into each cart item
        foreach ($data['picks'] as $pick) {
            $idx = $pick['index'];
            if (!isset($items[$idx])) continue;
            $items[$idx]['slot_id'] = (string)$pick['slot_id'];
        }

        $cart->update(['items' => $items]);

        // Build participant data so the payment page can use it
        $customer = auth('customer')->user();
        $bookingGuests = collect($items)->map(function ($it, $idx) use ($customer) {
            $participants = collect($it['participants'] ?? [])->map(function ($p) use ($customer) {
                return [
                    'is_self' => (bool)($p['is_self'] ?? false),
                    'name' => trim((string)($p['name'] ?? '')),
                    'phone' => trim((string)($p['phone'] ?? '')),
                    'email' => $p['email'] ?? null,
                    'is_uitm_member' => (bool)($p['is_uitm_member'] ?? false),
                ];
            })->values();

            if ($participants->isEmpty()) {
                $participants = collect([[
                    'is_self' => true,
                    'name' => $customer->name,
                    'phone' => $customer->phone ?? '',
                    'email' => $customer->email,
                    'is_uitm_member' => (bool)($customer->is_uitm_member ?? false),
                ]]);
            }

            return [
                'bookingIndex' => $idx,
                'list' => $participants->all(),
            ];
        })->values()->all();

        session()->put('booking_guests', $bookingGuests);

        $hasAdditionalGuests = collect($bookingGuests)
            ->contains(fn($row) => collect($row['list'] ?? [])->contains(fn($p) => !($p['is_self'] ?? false)));

        return redirect()->route($hasAdditionalGuests ? 'booking.guests' : 'booking.payment');
    }

    private function timeToMinutes($t): int
    {
        [$h, $m] = array_map('intval', explode(':', substr((string) $t, 0, 5)));
        return $h * 60 + $m;
    }

    private function minutesToTime(int $minutes): string
    {
        $h = (int) floor($minutes / 60);
        $m = $minutes % 60;
        return str_pad((string) $h, 2, '0', STR_PAD_LEFT) . ':' . str_pad((string) $m, 2, '0', STR_PAD_LEFT);
    }

    private function overlap(int $aStart, int $aEnd, int $bStart, int $bEnd): bool
    {
        return $aStart < $bEnd && $aEnd > $bStart;
    }
}
