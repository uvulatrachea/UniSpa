<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function markQrPaid(Request $request)
    {
        $customer = Auth::guard('customer')->user();
        if (!$customer) return response()->json(['error' => 'Not authenticated'], 401);

        $request->validate([
            'booking_id' => ['required','string'],
        ]);

        $booking = Booking::where('booking_id', $request->booking_id)->first();
        if (!$booking) return response()->json(['error' => 'Booking not found'], 404);

        if ((int)$booking->customer_id !== (int)$customer->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $booking->payment_method = 'qr';
        $booking->payment_status = 'pending'; // admin verify
        $booking->status = 'confirmed'; // or keep 'pending' if you want admin confirmation first
        $booking->save();

        return response()->json(['success' => true]);
    }

    public function createStripeCheckoutSession(Request $request)
    {
        $customer = Auth::guard('customer')->user();
        if (!$customer) return response()->json(['error' => 'Not authenticated'], 401);

        $request->validate([
            'booking_id' => ['required','string'],
        ]);

        $booking = Booking::with(['service'])->where('booking_id', $request->booking_id)->first();
        if (!$booking) return response()->json(['error' => 'Booking not found'], 404);

        if ((int)$booking->customer_id !== (int)$customer->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $amountCents = (int) round(((float)$booking->final_amount) * 100);
        if ($amountCents < 50) {
            return response()->json(['error' => 'Amount too low'], 422);
        }

        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $session = \Stripe\Checkout\Session::create([
            'mode' => 'payment',
            'payment_method_types' => ['card'],
            'line_items' => [[
                'quantity' => 1,
                'price_data' => [
                    'currency' => 'myr',
                    'unit_amount' => $amountCents,
                    'product_data' => [
                        'name' => $booking->service?->name
                            ? ('Spa Booking: ' . $booking->service->name)
                            : 'Spa Booking',
                    ],
                ],
            ]],
            'metadata' => [
                'booking_id' => $booking->booking_id,
                'customer_id' => (string)$customer->id,
            ],
            'success_url' => route('payment.stripe.success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('payment.stripe.cancel') . '?booking_id=' . $booking->booking_id,
        ]);

        $booking->payment_method = 'stripe';
        $booking->payment_status = 'unpaid';
        $booking->save();

        // ✅ BookingFlow.jsx wants "url"
        return response()->json([
            'success' => true,
            'url' => $session->url,
        ]);
    }

    public function stripeSuccess(Request $request)
    {
        $sessionId = $request->query('session_id');
        if (!$sessionId) return redirect('/bookings');

        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
        $session = \Stripe\Checkout\Session::retrieve($sessionId);

        $bookingId = $session->metadata->booking_id ?? null;

        if ($bookingId) {
            $booking = Booking::where('booking_id', $bookingId)->first();
            if ($booking) {
                $booking->payment_method = 'stripe';
                $booking->payment_status = 'paid';
                $booking->status = 'confirmed';
                $booking->save();
            }
        }

        return redirect('/bookings')->with('status', 'Payment successful!');
    }

    public function stripeCancel(Request $request)
    {
        return redirect('/bookings')->with('status', 'Payment cancelled.');
    }
}
