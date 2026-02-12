<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UniSpa OTP Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #7c3aed, #5b21b6);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
            color: #374151;
            line-height: 1.6;
        }
        .otp-box {
            background-color: #f3f4f6;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #7c3aed;
            letter-spacing: 8px;
            font-family: monospace;
        }
        .otp-label {
            font-size: 12px;
            color: #6b7280;
            margin-top: 8px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
        }
        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            margin: 16px 0;
            border-radius: 0 4px 4px 0;
            font-size: 14px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>UniSpa</h1>
            <p>University Wellness Platform</p>
        </div>
        
        <div class="content">
            <h2 style="color: #111827; margin-top: 0;">{{ $type === 'signup' ? 'Verify Your Email' : 'Your Login OTP' }}</h2>
            
            <p>Hello,</p>
            
            @if($type === 'signup')
                <p>Thank you for registering with UniSpa! To complete your account setup, please verify your email address by entering the OTP code below.</p>
            @else
                <p>You have requested a One-Time Password (OTP) to log in to your UniSpa account. Please enter the OTP code below.</p>
            @endif
            
            <div class="otp-box">
                <div class="otp-code">{{ $otp }}</div>
                <div class="otp-label">Your 6-digit OTP code</div>
            </div>
            
            <div class="warning">
                ⚠️ This OTP will expire in 10 minutes. Please do not share this code with anyone.
            </div>
            
            <p>If you did not request this OTP, please ignore this email or contact support if you have concerns.</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} UniSpa - University Wellness Platform</p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>
