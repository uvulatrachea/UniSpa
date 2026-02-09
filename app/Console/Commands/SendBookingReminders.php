<?php

namespace App\Console\Commands;

use App\Mail\BookingConfirmedMail;
use App\Models\Booking;
use App\Support\BookingCalendar;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendBookingReminders extends Command
{
    protected $signature = 'bookings:send-reminders';
    protected $description = 'Send booking reminder emails for upcoming appointments';

    public function handle(): int
    {
        $tz = config('app.timezone', 'Asia/Kuala_Lumpur');
        $from = now($tz)->addHours(23);
        $to = now($tz)->addHours(24);

        $bookings = Booking::with(['customer', 'participants', 'slot.service'])
            ->whereIn('status', ['confirmed', 'accepted'])
            ->get()
            ->filter(function (Booking $booking) use ($from, $to) {
                if (!$booking->slot) {
                    return false;
                }

                [$start] = BookingCalendar::dateTimes($booking);

                return $start->between($from, $to);
            });

        foreach ($bookings as $booking) {
            $recipients = collect();

            if (!empty($booking->customer?->email)) {
                $recipients->push([
                    'email' => strtolower(trim((string) $booking->customer->email)),
                    'name' => $booking->customer->name ?: 'Customer',
                ]);
            }

            foreach ($booking->participants ?? [] as $participant) {
                $email = strtolower(trim((string) ($participant->email ?? '')));
                if ($email === '') {
                    continue;
                }

                $recipients->push([
                    'email' => $email,
                    'name' => $participant->name ?: 'Guest',
                ]);
            }

            foreach ($recipients->unique('email') as $recipient) {
                Mail::to($recipient['email'])->send(
                    new BookingConfirmedMail(
                        booking: $booking,
                        isReminder: true,
                        recipientName: $recipient['name']
                    )
                );
            }
        }

        $this->info('Reminder emails sent: ' . $bookings->count());

        return self::SUCCESS;
    }
}
