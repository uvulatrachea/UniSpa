# Customer Authentication System - Setup Guide

## Overview
This is a complete customer login/signup system for UniSpa with:
- Email-based authentication with OTP verification
- Google OAuth integration
- Secure password creation with strength validation
- Real-time password visibility toggle

---

## File Structure Created

### Backend Files
```
app/
├── Http/
│   ├── Controllers/Auth/
│   │   └── CustomerAuthController.php          [Main auth logic]
│   └── Requests/Auth/
│       ├── SendOtpRequest.php                  [Email validation]
│       ├── VerifyOtpRequest.php                [OTP validation]
│       └── SignupRequest.php                   [Full signup validation]
├── Services/
│   └── OtpService.php                          [OTP generation/verification]
├── Models/
│   └── OtpVerification.php                     [Temporary OTP storage]
└── Mail/
    └── SendOtpEmail.php                        [OTP email mailable]

database/
└── migrations/
    ├── 2025_01_04_000000_add_otp_fields_to_customer_table.php
    └── 2025_01_04_000001_create_otp_verifications_table.php

resources/views/emails/
└── otp.blade.php                               [OTP email template]

routes/
└── auth.php                                    [Updated with customer routes]

config/
├── auth.php                                    [Updated with customer guard]
└── services.php                                [Updated with Google config]
```

### Frontend Files
```
resources/js/
├── Pages/Auth/
│   ├── CustomerLogin.jsx                       [Login page with tabs]
│   └── CustomerSignup.jsx                      [Signup page with 3 steps]
├── Components/Auth/
│   ├── PasswordInput.jsx                       [Input with visibility toggle]
│   ├── PasswordValidator.jsx                   [Real-time strength checker]
│   ├── GoogleButton.jsx                        [Google sign-in/up button]
│   └── OtpInput.jsx                            [6-digit OTP input]
└── Layouts/
    └── GuestLayout.jsx                         [Already exists]
```

---

## Step-by-Step Implementation

### 1. Install Required Packages

```bash
# Install Laravel Socialite for Google OAuth
composer require laravel/socialite

# Optional: If you want better rate limiting
composer require laravel/helpers
```

### 2. Run Migrations

```bash
# Run the new migrations
php artisan migrate

# Or specific migration:
php artisan migrate --path=database/migrations/2025_01_04_000000_add_otp_fields_to_customer_table.php
php artisan migrate --path=database/migrations/2025_01_04_000001_create_otp_verifications_table.php
```

### 3. Configure Environment Variables

Add to your `.env` file:

```env
# Google OAuth (get from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:8000/customer/auth/google/callback

# Email Configuration (example with Gmail)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@unispa.local
MAIL_FROM_NAME="UniSpa"
```

### 4. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google+ API**
4. Create OAuth 2.0 Credentials:
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     http://localhost:8000/customer/auth/google/callback
     https://yourdomain.com/customer/auth/google/callback
     ```
5. Copy the Client ID and Client Secret to your `.env`

### 5. Configure Email (Optional but Recommended for Testing)

**Using Gmail:**
1. Enable 2-factor authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows (or other device)"
4. Copy the generated 16-character password to `.env` as `MAIL_PASSWORD`

**Using MailHog (for local testing):**
```env
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Then run: `docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog`

---

## Routes Available

### Customer Login Routes
```
GET    /customer/auth/login                     Show login page
POST   /customer/auth/login-send-otp            Send OTP (rate limited: 5/min)
POST   /customer/auth/verify-otp-login          Verify OTP and login
GET    /customer/auth/google                    Redirect to Google
GET    /customer/auth/google/callback           Google callback
POST   /customer/auth/logout                    Logout customer
```

### Customer Signup Routes
```
GET    /customer/auth/signup                    Show signup page
POST   /customer/auth/signup-send-otp           Send signup OTP (rate limited: 5/min)
POST   /customer/auth/verify-otp-signup         Verify signup OTP
POST   /customer/auth/complete-signup           Create account after password setup
```

---

## How It Works

### Login Flow (Email)
1. User enters email
2. System sends 6-digit OTP to email (10-minute expiry)
3. User enters OTP
4. System verifies OTP (max 5 attempts)
5. User logged in and redirected to dashboard

### Login Flow (Google)
1. User clicks "Sign in with Google"
2. Redirects to Google login
3. Google redirects back with user data
4. System creates/updates customer account
5. User logged in and redirected to dashboard

### Signup Flow (Email)
1. **Step 1 - Info:**
   - Enter email, name, phone
   - System sends OTP
   
2. **Step 2 - OTP Verification:**
   - Enter 6-digit OTP
   - Max 5 failed attempts
   - Auto-expiry after 10 minutes
   
3. **Step 3 - Password Creation:**
   - Create strong password with validation:
     - Minimum 8 characters
     - At least 1 uppercase letter
     - At least 1 number
     - At least 1 special character (!@#$%^&*)
   - Password visibility toggle
   - Real-time strength indicator
   - Confirm password match
   - Agree to terms
   
4. Account created and user logged in

### Signup Flow (Google)
1. User clicks "Sign up with Google"
2. Creates account from Google data (no password required)
3. User logged in
4. Later prompted to complete profile/set password (optional)

---

## Security Features

✅ **Password Security**
- Hashed with bcrypt (Laravel's Hash::make())
- Real-time strength validation
- Visibility toggle (safe DOM manipulation)

✅ **OTP Security**
- Hashed in database with Hash::make()
- 10-minute expiration
- Max 5 verification attempts
- Rate limiting on sending (5 per minute)

✅ **Injection Protection**
- Parameterized queries (Eloquent ORM)
- Form request validation
- React's built-in XSS sanitization
- No dangerouslySetInnerHTML used

✅ **Session Security**
- Laravel session-based auth
- CSRF protection (automatic)
- Configurable session timeout

✅ **Email Verification**
- Hashed OTP storage
- Email-based verification

---

## Database Schema

### customer table additions
```sql
ALTER TABLE customer ADD COLUMN (
    otp_token VARCHAR(255) NULL,
    otp_expires_at TIMESTAMP NULL,
    is_email_verified BOOLEAN DEFAULT 0,
    google_id VARCHAR(255) UNIQUE NULL,
    auth_method ENUM('email', 'google') NULL,
    profile_completed BOOLEAN DEFAULT 0
);
```

### otp_verifications table
```sql
CREATE TABLE otp_verifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE,
    otp_token VARCHAR(255),
    expires_at TIMESTAMP,
    attempts INT DEFAULT 0,
    type VARCHAR(50) DEFAULT 'signup',
    signup_data JSON NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX (expires_at),
    INDEX (email)
);
```

---

## Testing the System

### Test Email Login (with MailHog)
1. Start MailHog: `docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog`
2. Go to http://localhost:8000/customer/auth/login
3. Enter registered email
4. Check http://localhost:8025 for OTP email
5. Enter OTP
6. Should be logged in

### Test Google Login
1. Go to http://localhost:8000/customer/auth/login
2. Click "Sign in with Google"
3. Use your Google account
4. Should create/login and redirect

### Test Email Signup
1. Go to http://localhost:8000/customer/auth/signup
2. Fill in info (email, name, phone)
3. Verify OTP
4. Create password (real-time validator shows requirements)
5. Account created and logged in

---

## Customization

### Change OTP Validity
In `app/Services/OtpService.php`:
```php
private const OTP_VALIDITY = 10; // Change to desired minutes
private const MAX_ATTEMPTS = 5;  // Max OTP verification attempts
```

### Change Password Requirements
Update regex in:
- `app/Http/Requests/Auth/SignupRequest.php` (backend)
- `resources/js/utils/passwordValidator.js` (frontend)

### Customize Email Template
Edit: `resources/views/emails/otp.blade.php`

### Change Redirect After Login
In `app/Http/Controllers/Auth/CustomerAuthController.php`:
```php
// Line ~130: Change '/dashboard' to desired route
return redirect('/dashboard');
```

---

## Troubleshooting

### OTP Email Not Sending
- Check `.env` mail configuration
- Verify email provider credentials
- Check `storage/logs/laravel.log` for errors
- Try MailHog for local testing

### Google Login Not Working
- Verify Google credentials in `.env`
- Check redirect URI matches in Google Console
- Ensure Socialite is installed: `composer show | grep socialite`

### CSRF Token Errors
- Clear cache: `php artisan cache:clear`
- Check session driver in `.env`
- Ensure `<meta name="csrf-token">` in HTML

### Rate Limiting Issues
- Adjust in `routes/auth.php`: `->middleware('throttle:5,1')`
- Change `5` to desired requests, `1` to time window (minutes)

---

## Next Steps (Optional)

1. **Profile Completion** - After signup, ask users to complete their profile
2. **Email Resend** - Allow users to request new OTP
3. **Two-Factor Authentication** - Add optional 2FA
4. **Account Recovery** - Password reset via email
5. **Phone Verification** - Optional phone OTP
6. **Password Strength Meter** - Visual strength indicator (already implemented)

---

## Support Files

- `.env.example.auth` - Environment variables guide
- Migrations in `database/migrations/`
- Controllers in `app/Http/Controllers/Auth/`
- Components in `resources/js/Components/Auth/`

---

**System is production-ready with proper security and validation!**
