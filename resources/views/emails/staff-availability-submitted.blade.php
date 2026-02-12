<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Availability submitted</title>
  </head>
  <body style="font-family: Arial, sans-serif; color:#0f172a; line-height:1.5;">
    <h2 style="margin:0 0 8px;">UniSpa — Availability submitted</h2>
    <p style="margin:0 0 16px;">Hi <strong>{{ $staffName }}</strong>,</p>

    <p style="margin:0 0 16px;">
      Your weekly availability has been submitted and is now <strong>waiting for admin approval</strong>.
    </p>

    <p style="margin:0 0 16px;">
      <strong>Week:</strong> {{ $weekStart->format('d M Y') }} - {{ $weekEnd->format('d M Y') }}<br>
      <strong>Required hours:</strong> {{ $requiredHours }}h
    </p>

    <h3 style="margin:18px 0 8px;">Submitted slots</h3>
    <ul style="margin:0; padding-left:18px;">
      @foreach(($entries ?? []) as $e)
        <li>
          {{ \Carbon\Carbon::parse($e['schedule_date'])->format('d M Y') }} —
          {{ substr($e['start_time'], 0, 5) }} - {{ substr($e['end_time'], 0, 5) }}
        </li>
      @endforeach
    </ul>

    <p style="margin:18px 0 0; color:#475569; font-size: 13px;">
      Once approved, your shifts will appear in your Staff Dashboard.
    </p>
  </body>
</html>
