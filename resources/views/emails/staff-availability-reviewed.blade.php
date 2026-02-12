<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Availability reviewed</title>
  </head>
  <body style="font-family: Arial, sans-serif; color:#0f172a; line-height:1.5;">
    <h2 style="margin:0 0 8px;">UniSpa — Availability {{ strtoupper($decision) }}</h2>
    <p style="margin:0 0 16px;">Hi <strong>{{ $staffName }}</strong>,</p>

    <p style="margin:0 0 16px;">
      Admin has <strong>{{ $decision }}</strong> your submitted availability.
    </p>

    <p style="margin:0 0 16px;">
      <strong>Period:</strong> {{ $monthStart->format('d M Y') }} - {{ $monthEnd->format('d M Y') }}<br>
      <strong>Items affected:</strong> {{ $itemsCount }}
    </p>

    @if($decision === 'rejected' && !empty($notes))
      <div style="border:1px solid #fecaca; background:#fff1f2; padding:12px; border-radius:10px;">
        <strong>Admin notes:</strong><br>
        {{ $notes }}
      </div>
    @endif

    <p style="margin:18px 0 0; color:#475569; font-size: 13px;">
      Please log in to UniSpa Staff Dashboard to view your updated shift status.
    </p>
  </body>
</html>
