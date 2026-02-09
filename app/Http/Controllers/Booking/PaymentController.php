<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmedMail;
use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Models\Cart;
use App\Models\Service;
use App\Models\Slot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PaymentController extends Controller
{
    private function generateBookingReceipt(Booking $booking, ?string $paymentReference = null): string
    {
        $service = $booking->slot?->service?->name ?: 'Spa Service';
        $customer = $booking->customer?->name ?: 'Customer';
        $date = optional($booking->slot?->slot_date)?->toDateString() ?: '-';
        $start = (string)($booking->slot?->start_time ?: '-');
        $end = (string)($booking->slot?->end_time ?: '-');

        $html = "<html><head><meta charset='utf-8'><title>Receipt {$booking->booking_id}</title></head><body style='font-family:Arial,sans-serif;padding:20px;'>"
            . "<h2>UniSpa Booking Receipt</h2>"
            . "<p><strong>Booking ID:</strong> {$booking->booking_id}</p>"
            . "<p><strong>Customer:</strong> {$customer}</p>"
            . "<p><strong>Service:</strong> {$service}</p>"
            . "<p><strong>Date:</strong> {$date}</p>"
            . "<p><strong>Time:</strong> {$start} - {$end}</p>"
            . "<p><strong>Final Amount:</strong> RM " . number_format((float)($booking->final_amount ?? $booking->total_amount ?? 0), 2) . "</p>"
            . "<p><strong>Deposit:</strong> RM " . number_format((float)($booking->deposit_amount ?? 0), 2) . "</p>"
            . "<p><strong>Payment Method:</strong> " . e((string)($booking->payment_method ?: '-')) . "</p>"
            . "<p><strong>Payment Status:</strong> " . e((string)($booking->payment_status ?: '-')) . "</p>"
            . "<p><strong>Reference:</strong> " . e((string)($paymentReference ?: '-')) . "</p>"
            . "<hr><p>Generated at " . now()->toDateTimeString() . "</p></body></html>";

        $base = 'receipts/' . $booking->booking_id . '-' . now()->format('YmdHis');

        if (class_exists(\Dompdf\Dompdf::class)) {
            $dompdf = new \Dompdf\Dompdf();
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4');
            $dompdf->render();

            $path = $base . '.pdf';
            Storage::disk('public')->put($path, $dompdf->output());

            return $path;
        }

        $path = $base . '.html';
        Storage::disk('public')->put($path, $html);

        return $path;
    }

    private function bookingRecipients(Booking $booking): array
    {
        $emails = collect();

        if (!empty($booking->customer?->email)) {
            $emails->push([
                'email' => strtolower(trim((string) $booking->customer->email)),
                'name' => $booking->customer->name ?: 'Customer',
            ]);
        }

        foreach ($booking->participants ?? [] as $participant) {
            $email = strtolower(trim((string) ($participant->email ?? '')));
            if ($email === '') {
                continue;
            }

            $emails->push([
                'email' => $email,
                'name' => $participant->name ?: 'Guest',
            ]);
        }

        return $emails
            ->unique(fn ($row) => $row['email'])
            ->values()
            ->all();
    }

    private function sendBookingEmails(Collection $bookings, bool $pendingReview = false): void
    {
        foreach ($bookings as $booking) {
            $recipients = $this->bookingRecipients($booking);

            foreach ($recipients as $recipient) {
                Mail::to($recipient['email'])->send(
                    new BookingConfirmedMail(
                        booking: $booking,
                        isPendingReview: $pendingReview,
                        recipientName: $recipient['name']
                    )
                );
            }
        }
    }

    private function stripeMockEnabled(): bool
    {
        return filter_var(config('services.stripe.mock', false), FILTER_VALIDATE_BOOL);
    }

    private function deposit30($amount): float
    {
        return round(((float)$amount) * 0.30, 2);
    }

    private function makeBookingId(): string
    {
        // e.g. BK7F3A2C9D
        return 'BK' . strtoupper(Str::random(8));
    }

    public function show()
    {
        $customerId = auth('customer')->user()->customer_id;
        $cart = Cart::where('customer_id', $customerId)->first();
        $items = $cart?->items ?? [];

        if (empty($items)) {
            return redirect()->route('booking.cart')
                ->with('error', 'Your cart is empty. Please add at least one service before payment.');
        }

        // Must have slot chosen for all items
        foreach ($items as $i => $it) {
            if (empty($it['slot_id'])) {
                return redirect()->route('booking.schedule')
                    ->with('error', "Please choose schedule for item #".($i+1));
            }
        }

        // Ensure participant data exists (self-only fallback) so payment + receipt can proceed.
        $bookingGuests = session()->get('booking_guests', []);
        if (empty($bookingGuests)) {
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
        }

        // Build preview totals (no DB writes yet)
        $serviceIds = collect($items)->pluck('service_id')->unique()->values()->all();
        $services = Service::whereIn('id', $serviceIds)->get()->keyBy('id');

        $slotIds = collect($items)->pluck('slot_id')->unique()->values()->all();
        $slots = Slot::whereIn('slot_id', $slotIds)->get()->keyBy('slot_id');

        $preview = collect($items)->map(function ($it, $idx) use ($services, $slots) {
            $s = $services->get((int)($it['service_id'] ?? 0));
            $sl = $slots->get($it['slot_id']);

            $unit = $s ? (float)$s->price : 0;
            $pax = (int)($it['quantity'] ?? $it['pax'] ?? 1);
            $total = round($unit * $pax, 2);

            return [
                'index' => $idx,
                'service' => $s ? [
                    'service_id' => $s->id,
                    'name' => $s->name,
                    'price' => (float)$s->price,
                    'duration_minutes' => (int)$s->duration_minutes,
                    'image_url' => $s->image_url,
                ] : null,
                'slot' => $sl ? [
                    'slot_id' => (string)$sl->slot_id,
                    'slot_date' => (string)$sl->slot_date,
                    'start_time' => (string)$sl->start_time,
                    'end_time' => (string)$sl->end_time,
                ] : null,
                'pax' => $pax,
                'final_amount' => $total,
                'deposit_amount' => $this->deposit30($total),
            ];
        })->values();

        $totalFinal = round($preview->sum('final_amount'), 2);
        $totalDeposit = round($preview->sum('deposit_amount'), 2);

        return Inertia::render('Booking/Payment', [
            'preview' => $preview,
            'totalFinal' => $totalFinal,
            'totalDeposit' => $totalDeposit,
            'qrUploadUrl' => route('booking.payment.qr.upload'),
            'stripeSessionUrl' => route('booking.payment.stripe.session'),
            'stripeMock' => $this->stripeMockEnabled(),
        ]);
    }

    /**
     * Create bookings in DB and return array booking_ids.
     * We do this only once right before payment.
     */
    private function createBookingsFromCart(bool $strictValidation = true): array
    {
        $customerId = auth('customer')->user()->customer_id;

        $cart = Cart::where('customer_id', $customerId)->lockForUpdate()->firstOrFail();
        $items = $cart->items ?? [];

        if ($strictValidation && empty($items)) {
            throw new \RuntimeException('Your cart is empty. Please add at least one service.');
        }

        $serviceIds = collect($items)->pluck('service_id')->unique()->values()->all();
        $services = Service::whereIn('id', $serviceIds)->get()->keyBy('id');

        $bookingGuests = session()->get('booking_guests', []);

        $created = [];

        foreach ($items as $idx => $it) {
            $service = $services->get((int)($it['service_id'] ?? 0));
            if ($strictValidation && !$service) {
                throw new \RuntimeException('One of the selected services is invalid or no longer available.');
            }

            $unit = $service ? (float)$service->price : 0;
            $pax = (int)($it['quantity'] ?? $it['pax'] ?? 1);
            $final = round($unit * $pax, 2);

            if ($strictValidation && $final <= 0) {
                throw new \RuntimeException('Selected service amount is 0. Please re-add the service in cart.');
            }

            $deposit = $this->deposit30($final);

            $bookingId = $this->makeBookingId();

            Booking::create([
                'booking_id' => $bookingId,
                'customer_id' => $customerId,
                'slot_id' => (string)$it['slot_id'],
                'total_amount' => $final,
                'discount_amount' => 0,
                'final_amount' => $final,
                'deposit_amount' => $deposit,
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);

            // Save participants for this booking index (if any)
            $row = collect($bookingGuests)->firstWhere('bookingIndex', $idx);
            $list = $row['list'] ?? [];

            foreach ($list as $p) {
                BookingParticipant::create([
                    'booking_id' => $bookingId,
                    'is_self' => (bool)$p['is_self'],
                    'name' => $p['name'],
                    'phone' => $p['phone'],
                    'email' => $p['email'] ?? null,
                    'is_uitm_member' => (bool)$p['is_uitm_member'],
                    'discount_amount' => 0,
                ]);
            }

            $created[] = $bookingId;
        }

        // Optional: clear cart after creating bookings
        $cart->update(['items' => []]);

        return $created;
    }

    // ========= STRIPE =========
    public function createStripeSession(Request $request)
    {
        // Install: composer require stripe/stripe-php
        $request->validate([]);

        $forceMock = $request->boolean('mock') || $this->stripeMockEnabled();

        if ($forceMock) {
            $bookingIds = DB::transaction(function () {
                return $this->createBookingsFromCart(false);
            });

            session()->put('mock_payment_booking_ids', $bookingIds);

            return response()->json([
                'id' => 'mock_' . Str::uuid()->toString(),
                'url' => route('booking.payment.stripe.success', [
                    'session_id' => 'mock_' . Str::uuid()->toString(),
                    'mock' => 1,
                    'booking_ids' => implode(',', $bookingIds),
                ]),
            ]);
        }

        $stripeSecret = (string) config('services.stripe.secret');
        if (blank($stripeSecret) || str_contains($stripeSecret, 'xxxxx')) {
            return response()->json([
                'error' => 'Stripe is not configured yet. Please set a real STRIPE_SECRET key in .env.',
            ], 422);
        }

        try {
            $session = DB::transaction(function () use ($stripeSecret) {
                $bookingIds = $this->createBookingsFromCart();

                $bookings = Booking::whereIn('booking_id', $bookingIds)->get();
                $depositTotal = round($bookings->sum('deposit_amount'), 2);

                if ($depositTotal <= 0) {
                    throw new \RuntimeException('Deposit amount must be greater than 0.');
                }

                \Stripe\Stripe::setApiKey($stripeSecret);

                return \Stripe\Checkout\Session::create([
                    'mode' => 'payment',
                    'line_items' => [[
                        'price_data' => [
                            'currency' => 'myr',
                            'product_data' => ['name' => 'UniSpa Booking Deposit (30%)'],
                            'unit_amount' => (int) round($depositTotal * 100), // cents
                        ],
                        'quantity' => 1,
                    ]],
                    'metadata' => [
                        'booking_ids' => implode(',', $bookingIds),
                    ],
                    'success_url' => route('booking.payment.stripe.success') . '?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url' => route('booking.payment.stripe.cancel'),
                ]);
            });

            // Return session id for frontend stripe redirect
            return response()->json([
                'id' => $session->id,
                'url' => $session->url,
            ]);
        } catch (\Stripe\Exception\AuthenticationException $e) {
            Log::error('Stripe authentication failed while creating checkout session.', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Invalid Stripe secret key. Please check STRIPE_SECRET in .env.',
            ], 422);
        } catch (\RuntimeException $e) {
            Log::warning('Stripe checkout blocked due to invalid booking/cart state.', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Stripe checkout session creation failed.', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Unable to create Stripe checkout session. Please try again.',
            ], 500);
        }
    }

    public function stripeSuccess(Request $request)
    {
        $request->validate([
            'session_id' => ['required','string'],
        ]);

        $bookingIds = [];
        $receiptId = $request->session_id;
        $isMock = $this->stripeMockEnabled()
            || $request->boolean('mock')
            || str_starts_with($request->session_id, 'mock_');

        if ($isMock) {
            $bookingIds = array_filter(explode(',', (string) $request->query('booking_ids', '')));

            if (empty($bookingIds)) {
                $bookingIds = session()->pull('mock_payment_booking_ids', []);
            }
        } else {
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
            $session = \Stripe\Checkout\Session::retrieve($request->session_id);
            $receiptId = $session->id;

            if (!empty($session->metadata?->booking_ids)) {
                $bookingIds = array_filter(explode(',', $session->metadata->booking_ids));
            }
        }

        if ($bookingIds) {
            Booking::whereIn('booking_id', $bookingIds)->update([
                'payment_method' => 'stripe',
                'payment_status' => 'paid',
                'status' => 'confirmed',
            ]);

            $confirmedBookings = Booking::with(['customer', 'participants', 'slot.service'])
                ->whereIn('booking_id', $bookingIds)
                ->get();

            foreach ($confirmedBookings as $booking) {
                $receiptPath = $this->generateBookingReceipt($booking, $receiptId);
                $booking->digital_receipt = $receiptPath;
                $booking->save();
            }

            $this->sendBookingEmails($confirmedBookings, false);
        }

        return redirect()->route('customer.dashboard')->with(
            'success',
            $isMock ? 'Mock payment marked as successful.' : 'Deposit paid successfully!'
        );
    }

    public function stripeCancel()
    {
        return redirect()->route('booking.payment')->with('error', 'Stripe payment cancelled.');
    }

    // ========= QR =========
    public function uploadQrReceipt(Request $request)
    {
        $request->validate([
            'receipt' => ['required','file','mimes:jpg,jpeg,png,webp,pdf','max:5120'],
        ]);

        $bookingIds = DB::transaction(function () {
            return $this->createBookingsFromCart();
        });

        $path = $request->file('receipt')->store('qr_deposits', 'public');

        Booking::whereIn('booking_id', $bookingIds)->update([
            'payment_method' => 'qr',
            'payment_status' => 'pending',
            'depo_qr_pic' => $path,
        ]);

        $pendingBookings = Booking::with(['customer', 'participants', 'slot.service'])
            ->whereIn('booking_id', $bookingIds)
            ->get();

        $this->sendBookingEmails($pendingBookings, true);

        $now = now(config('app.timezone', 'Asia/Kuala_Lumpur'));
        $isWeekday = $now->isWeekday();
        $isOfficeHour = $now->hour >= 9 && $now->hour < 18;

        $timingMessage = ($isWeekday && $isOfficeHour)
            ? 'A staff member will confirm shortly.'
            : 'Please wait until office hours for staff confirmation. Your slot is safe, no worries.';

        $message = 'Payment proof uploaded successfully. Booking confirmation email has been sent. '
            . 'Your booking has been noted. '
            . $timingMessage;

        return redirect()->route('bookings.index')
            ->with('success', $message);
    }
}
