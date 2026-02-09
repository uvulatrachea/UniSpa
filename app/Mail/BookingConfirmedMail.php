<?php

namespace App\Mail;

use App\Models\Booking;
use App\Support\BookingCalendar;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class BookingConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public bool $isUpdate = false,
        public bool $isReminder = false,
        public bool $isPendingReview = false,
        public ?string $recipientName = null,
    )
    {
    }

    public function envelope(): Envelope
    {
        $subject = $this->isPendingReview
            ? 'UniSpa Booking Received - Under Review'
            : ($this->isReminder
            ? 'UniSpa Reminder: Your Appointment is Coming Up'
            : ($this->isUpdate ? 'UniSpa Booking Updated' : 'UniSpa Booking Confirmed'));

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        [$start, $end] = BookingCalendar::dateTimes($this->booking);

        return new Content(
            view: 'emails.booking-confirmed',
            with: [
                'booking' => $this->booking,
                'start' => $start,
                'end' => $end,
                'serviceName' => $this->booking->slot?->service?->name ?: 'Spa Service',
                'customerName' => $this->recipientName ?: ($this->booking->customer?->name ?: 'Customer'),
                'googleCalendarUrl' => BookingCalendar::googleCalendarUrl($this->booking),
                'isUpdate' => $this->isUpdate,
                'isReminder' => $this->isReminder,
                'isPendingReview' => $this->isPendingReview,
            ],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromData(
                fn () => BookingCalendar::icsContent($this->booking, $this->recipientName),
                'unispa-booking-' . $this->booking->booking_id . '.ics'
            )->withMime('text/calendar; charset=UTF-8; method=REQUEST'),
        ];
    }
}
