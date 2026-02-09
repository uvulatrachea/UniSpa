<?php

namespace App\Support;

use App\Models\Booking;
use Carbon\Carbon;

class BookingCalendar
{
    public static function dateTimes(Booking $booking): array
    {
        $tz = config('app.timezone', 'Asia/Kuala_Lumpur');
        $date = optional($booking->slot?->slot_date)?->format('Y-m-d');
        $startTime = (string) ($booking->slot?->start_time ?? '10:00:00');
        $endTime = (string) ($booking->slot?->end_time ?? '11:00:00');

        if (!$date) {
            $start = Carbon::now($tz)->addHour();
            $end = Carbon::now($tz)->addHours(2);

            return [$start, $end];
        }

        $start = Carbon::parse(trim($date . ' ' . $startTime), $tz);
        $end = Carbon::parse(trim($date . ' ' . $endTime), $tz);

        return [$start, $end];
    }

    public static function googleCalendarUrl(Booking $booking): ?string
    {
        if (!$booking->slot) {
            return null;
        }

        [$start, $end] = self::dateTimes($booking);

        $title = ($booking->slot?->service?->name ?: 'UniSpa Appointment') . ' - UniSpa';
        $details = 'Booking ID: ' . $booking->booking_id . "\n"
            . 'Status: ' . ucfirst((string) $booking->status) . "\n"
            . 'Please arrive 10 minutes early.';
        $location = 'UNISPA Masmed UiTM Shah Alam';

        $params = [
            'action' => 'TEMPLATE',
            'text' => $title,
            'dates' => $start->copy()->utc()->format('Ymd\THis\Z') . '/' . $end->copy()->utc()->format('Ymd\THis\Z'),
            'details' => $details,
            'location' => $location,
        ];

        return 'https://calendar.google.com/calendar/render?' . http_build_query($params);
    }

    public static function icsContent(Booking $booking, ?string $recipientName = null): string
    {
        [$start, $end] = self::dateTimes($booking);

        $uid = (string) ($booking->booking_id ?: uniqid('unispa_', true));
        $service = $booking->slot?->service?->name ?: 'UniSpa Appointment';
        $customer = $recipientName ?: ($booking->customer?->name ?: 'Customer');
        $status = strtoupper((string) ($booking->status ?: 'CONFIRMED'));
        $description = "Hi {$customer}! Your booking is now set for {$start->format('D, d M Y h:i A')} - {$end->format('h:i A')}.\\nPlease arrive 10 minutes early.\\nBooking ID: {$booking->booking_id}.";

        $escape = static function (string $value): string {
            $value = str_replace('\\', '\\\\', $value);
            $value = str_replace(';', '\\;', $value);
            $value = str_replace(',', '\\,', $value);

            return str_replace(["\r\n", "\n", "\r"], '\\n', $value);
        };

        return implode("\r\n", [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//UNISPA//BOOKING//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:REQUEST',
            'BEGIN:VEVENT',
            'UID:' . $escape($uid),
            'DTSTAMP:' . now('UTC')->format('Ymd\THis\Z'),
            'DTSTART:' . $start->copy()->utc()->format('Ymd\THis\Z'),
            'DTEND:' . $end->copy()->utc()->format('Ymd\THis\Z'),
            'SUMMARY:' . $escape($service . ' - UniSpa'),
            'DESCRIPTION:' . $escape($description),
            'LOCATION:' . $escape('UNISPA Masmed UiTM Shah Alam'),
            'STATUS:' . ($status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED'),
            'END:VEVENT',
            'END:VCALENDAR',
            '',
        ]);
    }
}
