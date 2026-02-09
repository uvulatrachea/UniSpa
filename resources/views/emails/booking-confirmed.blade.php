<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UniSpa Booking</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f8fafc; color:#0f172a; padding:24px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:24px;">
        <h2 style="margin-top:0; color:#4c1d95;">
            Hi {{ $customerName }}!
        </h2>

        @if(!empty($isPendingReview))
            <p>Your booking request has been received and noted ✅</p>
            <p>
                We are currently reviewing your payment and booking details.
                A confirmation email will be sent once staff approval is completed.
            </p>
        @elseif($isReminder)
            <p>
                This is a friendly reminder that your UniSpa appointment is coming up soon.
                Please review your booking details below:
            </p>
        @elseif($isUpdate)
            <p>Your booking details were updated successfully. Here is your latest appointment information:</p>
        @else
            <p>
                Your booking is now set for
                <strong>{{ $start->format('D, d M Y') }}</strong>
                at
                <strong>{{ $start->format('h:i A') }}</strong>
                🎉
            </p>
            <p>Please make sure to arrive at least <strong>10 minutes early</strong>.</p>
        @endif

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin:16px 0;">
            <p style="margin:6px 0;"><strong>Service:</strong> {{ $serviceName }}</p>
            <p style="margin:6px 0;"><strong>Date:</strong> {{ $start->format('D, d M Y') }}</p>
            <p style="margin:6px 0;"><strong>Time:</strong> {{ $start->format('h:i A') }} - {{ $end->format('h:i A') }}</p>
            <p style="margin:6px 0;"><strong>Booking ID:</strong> {{ $booking->booking_id }}</p>
            <p style="margin:6px 0;"><strong>Status:</strong> {{ ucfirst((string) $booking->status) }}</p>
        </div>

        @if(!empty($isPendingReview))
            <p>
                Your slot is reserved in the system. If you uploaded outside office hours,
                staff will confirm during office time.
            </p>
        @endif

        @if(empty($isPendingReview) && !empty($googleCalendarUrl))
            <p style="margin-top:18px;">
                <a href="{{ $googleCalendarUrl }}" style="display:inline-block; background:#4c1d95; color:#fff; text-decoration:none; padding:10px 14px; border-radius:8px; font-weight:700;">
                    Add to Google Calendar
                </a>
            </p>
        @endif

        <p style="margin-top:24px; color:#475569; font-size:14px;">Thank you,<br>UNISPA Masmed UiTM Team</p>
    </div>
</body>
</html>
