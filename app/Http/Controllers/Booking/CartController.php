<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $customerId = auth('customer')->user()->customer_id;

        $cart = Cart::firstOrCreate(
            ['customer_id' => $customerId],
            ['items' => []]
        );

        // ✅ because Cart::$casts items => array, this is now a real array
        $items = is_array($cart->items) ? $cart->items : [];

        // ✅ your service PK is "id"
        $serviceIds = collect($items)
            ->pluck('service_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $services = Service::whereIn('id', $serviceIds)->get()->keyBy('id');

        // Attach service details for UI
        $enriched = collect($items)->map(function ($it, $index) use ($services) {
            $sid = $it['service_id'] ?? null;
            $s = $sid ? $services->get($sid) : null;

            return [
                'index' => $index, // ✅ used for delete
                'service_id' => $sid,
                'quantity' => (int)($it['quantity'] ?? 1),
                'participants' => $it['participants'] ?? [],
                'slot_id' => $it['slot_id'] ?? null,
                'service' => $s ? [
                    'id' => $s->id,
                    'name' => $s->name,
                    'price' => (float) $s->price,
                    'duration_minutes' => (int) $s->duration_minutes,
                    'image_url' => $s->image_url,
                ] : null,
            ];
        })->values();

        // Subtotal and UiTM 10% discount (match PaymentController logic)
        $subtotal = $enriched->sum(fn ($it) => (float)($it['service']['price'] ?? 0) * (int)($it['quantity'] ?? 1));
        $customer = auth('customer')->user();
        $isUitmMember = $customer && !empty($customer->is_uitm_member);
        $discountAmount = 0.0;
        $total = round($subtotal, 2);
        if ($isUitmMember && $subtotal > 0) {
            $discountAmount = round($subtotal * 0.10, 2);
            $total = round($subtotal - $discountAmount, 2);
        }

        return Inertia::render('Booking/Cart', [
            'cartItems' => $enriched,
            'subtotal' => round($subtotal, 2),
            'discountAmount' => $discountAmount,
            'total' => $total,
            'isUitmMember' => $isUitmMember,
        ]);
    }

    public function add(Request $request)
    {
        // ✅ match Services.jsx payload: quantity + participants
        $data = $request->validate([
            'service_id' => ['required','integer','exists:service,id'],
            'quantity' => ['nullable','integer','min:1','max:3'],
            'participants' => ['nullable','array'],
            'participants.*.is_self' => ['nullable','boolean'],
            'participants.*.name' => ['nullable','string','max:255'],
            'participants.*.phone' => ['nullable','string','max:50'],
            'participants.*.email' => ['nullable','email','max:255'],
        ]);

        $customerId = auth('customer')->user()->customer_id;

        $cart = Cart::firstOrCreate(
            ['customer_id' => $customerId],
            ['items' => []]
        );

        $items = is_array($cart->items) ? $cart->items : [];

        $items[] = [
            'service_id' => (int)$data['service_id'],
            'quantity' => (int)($data['quantity'] ?? 1),
            'participants' => $data['participants'] ?? [],
            'slot_id' => null, // chosen in schedule step
        ];

        $cart->update(['items' => $items]);

        // ✅ redirect back (Inertia will handle it)
        return back()->with('success', 'Added to cart');
    }

    public function remove(Request $request)
    {
        $data = $request->validate([
            'index' => ['required','integer','min:0'],
        ]);

        $customerId = auth('customer')->user()->customer_id;
        $cart = Cart::where('customer_id', $customerId)->firstOrFail();

        $items = is_array($cart->items) ? $cart->items : [];

        if (!array_key_exists($data['index'], $items)) {
            return back();
        }

        unset($items[$data['index']]);
        $cart->update(['items' => array_values($items)]);

        return back()->with('success', 'Removed');
    }

    public function clear(Request $request)
    {
        $customerId = auth('customer')->user()->customer_id;

        Cart::where('customer_id', $customerId)->update(['items' => []]);

        return back()->with('success', 'Cart cleared');
    }
}
