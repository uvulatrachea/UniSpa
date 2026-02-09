<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuestController extends Controller
{
    public function show()
    {
        $customer = auth('customer')->user();
        $customerId = $customer->customer_id;

        $cart = Cart::where('customer_id', $customerId)->first();
        $items = $cart?->items ?? [];

        $savedGuests = session()->get('booking_guests', []);

        return Inertia::render('Booking/Guests', [
            'cartItems' => $items,
            'savedGuests' => $savedGuests,
            'self' => [
                'name' => $customer->name,
                'phone' => $customer->phone ?? '',
                'email' => $customer->email,
                'is_uitm_member' => (bool)($customer->is_uitm_member ?? false),
            ],
        ]);
    }

    public function save(Request $request)
    {
        $data = $request->validate([
            'guests' => ['required','array'],
            'guests.*.bookingIndex' => ['required','integer','min:0'],
            'guests.*.list' => ['required','array'],
            'guests.*.list.*.is_self' => ['required','boolean'],
            'guests.*.list.*.name' => ['required','string','max:255'],
            'guests.*.list.*.phone' => ['required','string','max:255'],
            'guests.*.list.*.email' => ['nullable','string','max:255'],
            'guests.*.list.*.is_uitm_member' => ['required','boolean'],
        ]);

        session()->put('booking_guests', $data['guests']);

        return redirect()->route('booking.payment');
    }
}
