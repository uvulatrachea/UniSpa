<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Models\Service;
use App\Models\Slot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    // POST /booking/slots
    public function slots(Request $request)
    {
        $request->validate([
            'service_id' => ['required', 'integer'],
            'date' => ['required', 'date'],
        ]);

        $serviceId = (int) $request->service_id;
        $date = $request->date;

        // Only "available" slots that are not booked
        $slots = Slot::query()
            ->where('service_id', $serviceId)
            ->where('slot_date', $date)
            ->where('status', 'available')
            ->whereDoesntHave('bookings')
            ->orderBy('start_time')
            ->get(['slot_id', 'start_time', 'end_time', 'staff_id']);

        // optional: attach staff name if you have staff table later
        $slots = $slots->map(function ($s) {
            return [
                'slot_id' => $s->slot_id,
                'start_time' => $s->start_time,
                'end_time' => $s->end_time,
                'staff_name' => $s->staff_id ? ('Staff #' . $s->staff_id) : 'Available',
            ];
        });

        return response()->json(['slots' => $slots]);
    }

    // POST /booking/checkout
    // Creates a draft booking (and calculates total)
    public function checkout(Request $request)
    {
        $customer = Auth::guard('customer')->user();
        if (!$customer) return response()->json(['error' => 'Not authenticated'], 401);

        $request->validate([
            'service_id' => ['required', 'integer'],
            'slot_id' => ['required', 'string'],
            'pax' => ['required', 'integer', 'min:1', 'max:10'],
            'special_requests' => ['nullable', 'string'],
        ]);

        $customerId = $customer->id;
        $service = Service::findOrFail((int)$request->service_id);

        // ensure slot belongs to the service and is available
        $slot = Slot::where('slot_id', $request->slot_id)
            ->where('service_id', $service->id)
            ->where('status', 'available')
            ->first();

        if (!$slot) return response()->json(['error' => 'Invalid slot'], 422);

        // prevent double-booking
        $already = Booking::where('slot_id', $slot->slot_id)->exists();
        if ($already) return response()->json(['error' => 'Slot already booked'], 409);

        $pax = (int)$request->pax;

        // simple pricing: service.price * pax
        $subtotal = (float)$service->price * $pax;

        // UiTM members get 10% off
        $discount = 0.00;
        if ($customer->is_uitm_member && $subtotal > 0) {
            $discount = round($subtotal * 0.10, 2);
        }
        $final = max(0, round($subtotal - $discount, 2));

        $bookingId = 'BK' . strtoupper(Str::random(10));

        $booking = Booking::create([
            'booking_id' => $bookingId,
            'customer_id' => $customerId,
            'slot_id' => $slot->slot_id,
            'total_amount' => $subtotal,
            'discount_amount' => $discount,
            'final_amount' => $final,
            'deposit_amount' => 0,
            'status' => 'pending',
            'payment_method' => null,
            'payment_status' => 'pending',
            'special_requests' => $request->special_requests,
        ]);

        return response()->json([
            'booking' => [
                'booking_id' => $booking->booking_id,
                'subtotal_amount' => (string) $booking->total_amount,
                'discount_amount' => (string) $booking->discount_amount,
                'final_amount' => (string) $booking->final_amount,
            ]
        ]);
    }

    // POST /booking/guests
    public function guests(Request $request)
    {
        $customer = Auth::guard('customer')->user();
        if (!$customer) return response()->json(['error' => 'Not authenticated'], 401);

        $request->validate([
            'booking_id' => ['required', 'string'],
            'pax' => ['required', 'integer', 'min:1', 'max:10'],
            'guests' => ['required', 'array'],
            'guests.*.name' => ['required', 'string'],
            'guests.*.phone' => ['required', 'string'],
            'guests.*.email' => ['nullable', 'string'],
            'guests.*.is_uitm_member' => ['nullable', 'boolean'],
        ]);

        $booking = Booking::where('booking_id', $request->booking_id)->first();
        if (!$booking) return response()->json(['error' => 'Booking not found'], 404);

        if ((int)$booking->customer_id !== (int)$customer->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        DB::transaction(function () use ($booking, $request) {
            // clear existing extras (optional)
            BookingParticipant::where('booking_id', $booking->booking_id)
                ->where('is_self', false)
                ->delete();

            foreach ($request->guests as $g) {
                BookingParticipant::create([
                    'booking_id' => $booking->booking_id,
                    'name' => $g['name'],
                    'phone' => $g['phone'],
                    'email' => $g['email'] ?? null,
                    'is_uitm_member' => (bool)($g['is_uitm_member'] ?? false),
                    'is_self' => false,
                    'discount_amount' => 0,
                ]);
            }
        });

        return response()->json([
            'booking' => [
                'booking_id' => $booking->booking_id,
                'subtotal_amount' => (string) $booking->total_amount,
                'discount_amount' => (string) $booking->discount_amount,
                'final_amount' => (string) $booking->final_amount,
            ]
        ]);
    }
}
