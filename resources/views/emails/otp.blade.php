<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UniSpa OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #333;
            margin: 0;
            font-size: 28px;
        }
        .logo {
            color: #7c3aed;
            font-weight: bold;
        }
        .content {
            text-align: center;
            margin-bottom: 30px;
        }
        .content p {
            color: #666;
            line-height: 1.6;
            margin: 10px 0;
        }
        .otp-box {
            background-color: #f0f0f0;
            border: 2px dashed #7c3aed;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #7c3aed;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
        }
        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #78350f;
        }
        .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        .type-badge {
            display: inline-block;
            background-color: #7c3aed;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            margin-bottom: 15px;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="logo">UniSpa</span></h1>
            <p style="color: #999; margin: 5px 0;">Spa Management System</p>
        </div>

        <div class="content">
            <div class="type-badge">
                {{ $type === 'signup' ? 'Sign Up Verification' : 'Login Verification' }}
            </div>

            @if($type === 'signup')
                <p>Thank you for signing up with UniSpa!</p>
                <p>To complete your registration, please verify your email address using the code below:</p>
            @else
                <p>Your UniSpa login code is ready.</p>
                <p>Use the code below to sign in to your account:</p>
            @endif

            <div class="otp-box">
                <div class="otp-code">{{ $otp }}</div>
            </div>

            <p style="color: #666; font-size: 14px;">
                This code will expire in <strong>10 minutes</strong>
            </p>

            <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                Never share this code with anyone. UniSpa staff will never ask for your OTP code.
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 25px;">
                If you didn't request this code, please ignore this email.
            </p>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} UniSpa Management System. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly.</p>
        </div>
    </div>
</body>
</html>
