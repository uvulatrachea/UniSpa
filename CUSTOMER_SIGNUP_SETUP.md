# Quick Setup Guide - Customer Signup Implementation

## What Was Implemented

### ✅ Completed Components

1. **Backend:**
   - ✅ `CustomerSignupController` - API endpoints for signup flow
   - ✅ `OtpService` - OTP generation, sending, and verification
   - ✅ `OtpVerification` Model - Database model for OTP records
   - ✅ Routes configured in `routes/auth.php`

2. **Frontend:**
   - ✅ `CustomerSignup.jsx` - Complete signup UI with:
     - Customer type selection (UITM vs Non-UITM)
     - Conditional OTP flow
     - Password strength validation
     - Step indicators

3. **Email:**
   - ✅ `SendOtpEmail` Mailable - Email template for OTP delivery

---

## Running the Application

### 1. Database Migration
Make sure the `otp_verifications` table exists:

```bash
# If migration doesn't exist, create it:
php artisan make:migration create_otp_verifications_table

# Run migrations:
php artisan migrate
```

### 2. Environment Configuration
Update `.env` with email settings:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS=noreply@unispa.local
MAIL_FROM_NAME="UniSpa"
```

### 3. Start the Development Server
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite (frontend build)
npm run dev
```

### 4. Access the Signup Page
```
http://localhost:8000/register
```

Or navigate to the customer signup:
```
http://localhost:8000/customer/signup
```

---

## Testing the Signup Flow

### Test Case 1: UITM Member Signup
1. Navigate to signup page
2. Enter details:
   - Name: "John Doe"
   - Email: "student@uitm.edu.my"
   - Phone: "0101234567"
   - Customer Type: Select "UITM Member"
3. Click "Continue"
4. Receive OTP in email (or check mailtrap inbox)
5. Enter 6-digit OTP
6. Create password (must meet all requirements)
7. Agree to terms
8. Click "Create Account"
9. Redirected to dashboard

### Test Case 2: Non-UITM Customer Signup
1. Navigate to signup page
2. Enter details:
   - Name: "Jane Smith"
   - Email: "jane@gmail.com"
   - Phone: "0109876543"
   - Customer Type: Select "Non-UITM Customer"
3. Click "Continue"
4. **Note:** OTP step is skipped
5. Create password
6. Agree to terms
7. Click "Create Account"
8. Redirected to dashboard

### Test Case 3: UITM with Non-UITM Email
1. Select "UITM Member"
2. Enter non-@uitm email (e.g., "student@gmail.com")
3. Click "Continue"
4. See error: "For UITM members, please use your @uitm.edu.my email address"

### Test Case 4: Invalid Password
1. Enter password: "weak"
2. See validation error: "Password must be at least 8 characters"
3. See requirement checklist failing

### Test Case 5: Resend OTP
1. On OTP verification step
2. Click "Resend OTP"
3. New OTP sent
4. Enter new OTP

---

## File Locations & Quick Reference

### Backend Files
| File | Location |
|------|----------|
| CustomerSignupController | `app/Http/Controllers/Auth/CustomerSignupController.php` |
| OtpService | `app/Services/OtpService.php` |
| OtpVerification Model | `app/Models/OtpVerification.php` |
| Routes | `routes/auth.php` |

### Frontend Files
| File | Location |
|------|----------|
| Signup Component | `resources/js/Pages/Auth/CustomerSignup.jsx` |
| OTP Input Component | `resources/js/Components/Auth/OtpInput.jsx` |
| Password Input | `resources/js/Components/Auth/PasswordInput.jsx` |
| Password Validator | `resources/js/Components/Auth/PasswordValidator.jsx` |

### Email Files
| File | Location |
|------|----------|
| OTP Email Mailable | `app/Mail/SendOtpEmail.php` |
| OTP Email Template | `resources/views/emails/otp.blade.php` |

### Documentation
| File | Location |
|------|----------|
| Full Documentation | `CUSTOMER_SIGNUP_FLOW.md` |
| This Guide | `CUSTOMER_SIGNUP_SETUP.md` |

---

## API Endpoints

All endpoints use `POST` method and require CSRF token:

| Endpoint | Purpose |
|----------|---------|
| `/customer/signup/send-otp` | Check customer type and send OTP if UITM |
| `/customer/signup/verify-otp` | Verify 6-digit OTP code |
| `/customer/signup/resend-otp` | Resend OTP (rate limited) |
| `/customer/signup/complete` | Create account and login |

---

## Key Variables & Constants

### OtpService Constants
```php
OTP_EXPIRY_MINUTES = 10      // OTP valid for 10 minutes
MAX_ATTEMPTS = 5              // Max OTP verification attempts
```

### Database Fields (customer table)
```php
is_uitm_member              // boolean
verification_status         // 'pending' or 'verified'
cust_type                   // 'regular', 'uitm_student', 'uitm_staff'
email_verified_at           // timestamp (set for UITM only)
```

---

## Email Configuration

### Using Mailtrap (Development)
1. Sign up at https://mailtrap.io
2. Get credentials from dashboard
3. Update `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
```

### Using Real SMTP
1. Update `.env` with your SMTP provider
2. Ensure firewall allows outbound SMTP (port 587 or 2525)

### Testing Locally Without Email
1. Use `MAIL_DRIVER=log` in `.env`
2. Check `storage/logs/laravel.log` for email output

---

## Common Issues & Solutions

### Issue: "Column not found" error
**Solution:** Run database migration
```bash
php artisan migrate
```

### Issue: "CSRF token mismatch"
**Solution:** Ensure meta tag exists in layout:
```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```

### Issue: OTP not sending
**Solution:** 
1. Check MAIL configuration in `.env`
2. Try `php artisan tinker` and test:
```php
Mail::raw('Test', function($message) {
    $message->to('your@email.com');
});
```

### Issue: "Email already exists"
**Solution:** Use unique email for each test account

### Issue: Password validation not working
**Solution:** Ensure all requirements are met:
- ✓ 8+ characters
- ✓ 1 uppercase letter
- ✓ 1 number  
- ✓ 1 special character

---

## Password Requirements

The password must contain:
```
Minimum 8 characters
At least 1 UPPERCASE letter (A-Z)
At least 1 number (0-9)
At least 1 special character (!@#$%^&*()_+-=[]{}..etc)
```

**Valid Example:** `SecurePass123!`  
**Invalid Examples:** 
- `weak` (too short)
- `Password123` (no special char)
- `Password!` (no number)

---

## Frontend Form Fields

### Step 1: Customer Info
- `name` (text, required)
- `email` (email, required)
- `phone` (tel, required, ≥10 digits)
- `customer_type` (radio, required: 'uitm' | 'non-uitm')

### Step 2: OTP (UITM Only)
- `otp` (text, 6 digits)

### Step 3: Password
- `password` (password, required)
- `password_confirmation` (password, required)
- `agree_terms` (checkbox, required)

---

## Backend Validation Rules

```php
'email' => 'required|email|unique:customer,email'
'name' => 'required|string|max:255'
'phone' => 'required|string|min:10'
'customer_type' => 'required|in:uitm,non-uitm'
'password' => 'required|min:8|confirmed'
```

---

## Customer Account Flags

### UITM Member
```php
is_uitm_member = true
verification_status = 'verified'
cust_type = 'uitm_student'
email_verified_at = now()
```

### Non-UITM Customer
```php
is_uitm_member = false
verification_status = 'pending'
cust_type = 'regular'
email_verified_at = null
```

---

## Database Queries

### Check all customers
```sql
SELECT * FROM customer WHERE 1=1;
```

### Check UITM members
```sql
SELECT * FROM customer WHERE is_uitm_member = 1;
```

### Check pending verifications
```sql
SELECT * FROM customer WHERE verification_status = 'pending';
```

### Check OTP records
```sql
SELECT * FROM otp_verifications ORDER BY created_at DESC;
```

---

## Scheduled Tasks (Optional)

To clean up expired OTPs automatically, add to `app/Console/Kernel.php`:

```php
$schedule->call(function () {
    \App\Services\OtpService::cleanupExpiredOtps();
})->hourly();
```

---

## Next Steps

1. ✅ Run migrations
2. ✅ Configure email
3. ✅ Test UITM signup flow
4. ✅ Test Non-UITM signup flow
5. ✅ Verify database records
6. ⬜ (Optional) Add Google OAuth
7. ⬜ (Optional) Add SMS OTP
8. ⬜ (Optional) Customize email templates

---

## Support & Debugging

### Enable Query Logging
```php
// In any route/controller
DB::enableQueryLog();
// ...code...
dd(DB::getQueryLog());
```

### Enable Mail Debugging
```bash
# Check laravel logs
tail -f storage/logs/laravel.log

# Or use mailtrap inbox
```

### Check Current Authentication
```php
// In any controller
dd(Auth::user());
```

---

**Version:** 1.0  
**Setup Time:** ~15 minutes  
**Last Updated:** 2026-01-05
