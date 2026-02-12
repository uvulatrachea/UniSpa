<?php

namespace App\Mail;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffAvailabilitySubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param array<int, array{schedule_date:string,start_time:string,end_time:string}> $entries
     */
    public function __construct(
        public string $staffName,
        public Carbon $weekStart,
        public Carbon $weekEnd,
        public int $requiredHours,
        public array $entries,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'UniSpa: Availability submitted (Waiting admin approval)'
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.staff-availability-submitted',
            with: [
                'staffName' => $this->staffName,
                'weekStart' => $this->weekStart,
                'weekEnd' => $this->weekEnd,
                'requiredHours' => $this->requiredHours,
                'entries' => $this->entries,
            ]
        );
    }
}
