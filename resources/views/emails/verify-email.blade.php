<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - UniSpa</title>
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
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #7c3aed, #5b21b6);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }
        .button:hover {
            background: linear-gradient(135deg, #6d28d9, #4c1d95);
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
        }
        .note {
            background-color: #f3f4f6;
            border-left: 4px solid #7c3aed;
            padding: 12px 16px;
            margin: 16px 0;
            border-radius: 0 4px 4px 0;
            font-size: 14px;
            color: #4b5563;
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
            <h2 style="color: #111827; margin-top: 0;">Verify Your Email Address</h2>
            
            <p>Hello {{ $user->name }},</p>
            
            <p>Thank you for creating an account with UniSpa! To complete your registration, please verify your email address by clicking the button below.</p>
            
            <div class="button-container">
                <a href="{{ $verificationUrl }}" class="button">Verify Email Address</a>
            </div>
            
            <div class="note">
                <strong>Note:</strong> This verification link will expire in 60 minutes for security purposes.
            </div>
            
            <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; color: #7c3aed; font-size: 13px;">{{ $verificationUrl }}</p>
            
            <p>If you did not create an account with UniSpa, please ignore this email or contact support if you have concerns.</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} UniSpa - University Wellness Platform</p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>
