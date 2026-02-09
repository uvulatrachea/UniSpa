<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Service;
use App\Models\Slot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
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

        // Support both schemas:
        // - newer migration: slot.slot_id (string), slot.service_id, slot_date, start_time, end_time, status
        // - older SQL: may contain room_id, but not required here
        $q = DB::table('slot')
            ->where('service_id', $data['service_id'])
            ->where('slot_date', $data['date'])
            ->where('status', 'available')
            ->orderBy('start_time');

        $cols = ['slot_id', 'slot_date', 'start_time', 'end_time', 'status'];
        if (Schema::hasColumn('slot', 'room_id')) $cols[] = 'room_id';
        if (Schema::hasColumn('slot', 'staff_id')) $cols[] = 'staff_id';

        $slots = $q->get($cols);

        return response()->json(['slots' => $slots]);
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

        $dates = DB::table('slot')
            ->where('service_id', $data['service_id'])
            ->whereBetween('slot_date', [$start, $end])
            ->where('status', 'available')
            ->selectRaw('slot_date')
            ->distinct()
            ->orderBy('slot_date')
            ->pluck('slot_date')
            ->map(fn($d) => (string)$d)
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

        // ✅ safety check: chosen slots still available
        foreach ($data['picks'] as $pick) {
            $slotId = (string)$pick['slot_id'];

            $slot = Slot::where('slot_id', $slotId)->first();
            if (!$slot) {
                return back()->with('error', "Selected time slot no longer exists.");
            }

            if ($slot->status !== 'available' || ($slot->booked_count >= $slot->max_capacity)) {
                return back()->with('error', "That time slot is already full. Please pick another time.");
            }
        }

        foreach ($data['picks'] as $pick) {
            $idx = $pick['index'];
            if (!isset($items[$idx])) continue;
            $items[$idx]['slot_id'] = (string)$pick['slot_id'];
        }

        $cart->update(['items' => $items]);

        // Persist participants from cart so payment/receipt can use them directly.
        // This lets self-only bookings skip the guest form entirely.
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
}
