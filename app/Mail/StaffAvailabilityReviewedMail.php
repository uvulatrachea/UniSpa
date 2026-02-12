<?php

namespace App\Mail;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffAvailabilityReviewedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param 'approved'|'rejected' $decision
     */
    public function __construct(
        public string $staffName,
        public Carbon $monthStart,
        public Carbon $monthEnd,
        public string $decision,
        public int $itemsCount,
        public ?string $notes = null,
    ) {
    }

    public function envelope(): Envelope
    {
        $label = strtoupper($this->decision);
        return new Envelope(
            subject: "UniSpa: Availability {$label}"
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.staff-availability-reviewed',
            with: [
                'staffName' => $this->staffName,
                'monthStart' => $this->monthStart,
                'monthEnd' => $this->monthEnd,
                'decision' => $this->decision,
                'itemsCount' => $this->itemsCount,
                'notes' => $this->notes,
            ]
        );
    }
}
