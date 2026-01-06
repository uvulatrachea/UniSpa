# UniSpa Customer Signup Flow Documentation

## Overview
This document describes the complete customer signup flow for UniSpa, which supports two types of customers:
1. **UITM Members** (Students/Staff) - Requires email verification via OTP
2. **Non-UITM Customers** (General Public) - Direct signup without email verification

---

## Architecture & Components

### Backend Components

#### 1. **OtpService** (`app/Services/OtpService.php`)
Handles all OTP-related operations:
- `generateAndSendOtp($email, $name, $type)` - Generates 6-digit OTP and sends via email
- `verifyOtp($email, $otp)` - Validates OTP with attempt limiting
- `resendOtp($email, $name)` - Resends OTP with rate limiting (max 3 per 5 minutes)
- `isUitmEmail($email)` - Checks if email is `@uitm.edu.my` domain
- `cleanupExpiredOtps()` - Removes expired OTPs (run via cron)

**Key Features:**
- OTP validity: 10 minutes
- Max failed attempts: 5
- Rate limiting: 3 resends per 5 minutes

#### 2. **OtpVerification Model** (`app/Models/OtpVerification.php`)
Database model for storing OTP records:
```php
- email: string (primary identifier)
- otp_token: string (hashed)
- type: string ('signup' | 'forgot_password')
- expires_at: datetime
- is_verified: boolean
- attempts: integer
- created_at, updated_at: timestamps
```

#### 3. **CustomerSignupController** (`app/Http/Controllers/Auth/CustomerSignupController.php`)
Handles all signup-related API endpoints:

- **sendOtp()** - `POST /customer/signup/send-otp`
  - Input: email, name, phone, customer_type
  - Logic:
    - Validates email uniqueness
    - If UITM: Validates @uitm.edu.my domain, sends OTP
    - If Non-UITM: Skips OTP requirement
  - Response: indicates if OTP required

- **verifyOtp()** - `POST /customer/signup/verify-otp`
  - Input: email, otp
  - Logic: Validates OTP with attempt tracking
  - Response: success/failure with message

- **resendOtp()** - `POST /customer/signup/resend-otp`
  - Input: email, name
  - Logic: Rate-limited resend with validation
  - Response: success/failure

- **completeSignup()** - `POST /customer/signup/complete`
  - Input: email, name, phone, password, customer_type, agree_terms
  - Logic:
    - For UITM: Verifies OTP was verified first
    - For Non-UITM: Skips OTP verification
    - Creates User account
    - Sets appropriate flags (is_uitm_member, verification_status, cust_type)
    - Logs in user automatically
  - Response: redirect to dashboard

### Frontend Components

#### **CustomerSignup.jsx** (`resources/js/Pages/Auth/CustomerSignup.jsx`)
React component implementing the signup UI with three steps:

1. **Step 1: Info (Customer Type Selection)**
   - Full Name input
   - Email input
   - Phone input
   - **Customer Type Radio Buttons:**
     - ✓ UITM Member (Student/Staff)
     - ✓ Non-UITM Customer
   - Button: "Continue"
   - Validation:
     - All fields required
     - UITM customers MUST use @uitm.edu.my email
     - Phone must be ≥10 digits

2. **Step 2: OTP Verification (UITM Only)**
   - Shows OTP sent message
   - 6-digit OTP input field
   - Button: "Verify OTP"
   - Button: "Resend OTP"
   - Button: "Back to Info"
   - Auto-skipped for Non-UITM customers

3. **Step 3: Password Creation**
   - Password input with strength indicator
   - Confirm password input
   - Terms & Conditions checkbox
   - Password requirements:
     - Minimum 8 characters
     - At least 1 uppercase letter
     - At least 1 number
     - At least 1 special character
   - Button: "Create Account"
   - Back button (only visible if OTP was required)

#### **Email Template** (`resources/views/emails/otp.blade.php`)
HTML email template for OTP delivery.

---

## Signup Flow Diagrams

### UITM Member Signup Flow
```
Start
  ↓
[Step 1] Info Page
  - Enter: Name, Email (@uitm.edu.my), Phone
  - Select: UITM Member
  - Validate all fields + email domain
  ↓
[Step 2] OTP Page
  - Send OTP to email (valid for 10 min)
  - Enter 6-digit code
  - Max 5 attempts
  - Can resend (max 3 times per 5 min)
  ↓
[Step 3] Password Page
  - Create password (strong requirements)
  - Confirm password
  - Agree to Terms
  ↓
Account Created ✓
  - is_uitm_member = true
  - verification_status = 'verified'
  - cust_type = 'uitm_student'
  - email_verified_at = now()
  ↓
Auto-login → Dashboard
```

### Non-UITM Customer Signup Flow
```
Start
  ↓
[Step 1] Info Page
  - Enter: Name, Email (any), Phone
  - Select: Non-UITM Customer
  - Validate all fields
  ↓
[Step 3] Password Page (OTP skipped)
  - Create password (strong requirements)
  - Confirm password
  - Agree to Terms
  ↓
Account Created ✓
  - is_uitm_member = false
  - verification_status = 'pending'
  - cust_type = 'regular'
  - email_verified_at = null
  ↓
Auto-login → Dashboard
```

---

## Database Schema

### customer table (User Model)
```sql
customer_id (PK)
name
email (UNIQUE)
phone
password (hashed)
is_uitm_member (boolean)
verification_status (enum: 'pending', 'verified')
cust_type (enum: 'regular', 'uitm_student', 'uitm_staff')
email_verified_at (nullable)
created_at, updated_at
```

### otp_verifications table (OtpVerification Model)
```sql
id (PK)
email
otp_token (hashed)
type (enum: 'signup', 'forgot_password')
expires_at
is_verified (boolean)
attempts
created_at, updated_at
```

---

## API Endpoints

### 1. Send OTP / Skip OTP
**POST** `/customer/signup/send-otp`

**Request:**
```json
{
  "email": "student@uitm.edu.my",
  "name": "John Doe",
  "phone": "+60101234567",
  "customer_type": "uitm"
}
```

**Response (UITM):**
```json
{
  "success": true,
  "message": "OTP sent to your email...",
  "requires_otp": true,
  "customer_type": "uitm",
  "otp_expiry_minutes": 10
}
```

**Response (Non-UITM):**
```json
{
  "success": true,
  "message": "Proceed to password creation",
  "requires_otp": false,
  "customer_type": "non-uitm"
}
```

### 2. Verify OTP
**POST** `/customer/signup/verify-otp`

**Request:**
```json
{
  "email": "student@uitm.edu.my",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verified! Now create your password."
}
```

**Response (Invalid):**
```json
{
  "success": false,
  "message": "Invalid OTP. Please try again.",
  "attempts_left": 3
}
```

### 3. Resend OTP
**POST** `/customer/signup/resend-otp`

**Request:**
```json
{
  "email": "student@uitm.edu.my",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New OTP sent to your email..."
}
```

### 4. Complete Signup
**POST** `/customer/signup/complete`

**Request:**
```json
{
  "email": "student@uitm.edu.my",
  "name": "John Doe",
  "phone": "+60101234567",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "customer_type": "uitm",
  "agree_terms": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully!",
  "redirect": "/dashboard"
}
```

---

## Routes Configuration

Added to `routes/auth.php`:

```php
Route::middleware('guest')->group(function () {
    Route::post('customer/signup/send-otp', [CustomerSignupController::class, 'sendOtp'])
        ->name('customer.signup.send-otp');
    
    Route::post('customer/signup/verify-otp', [CustomerSignupController::class, 'verifyOtp'])
        ->name('customer.signup.verify-otp');
    
    Route::post('customer/signup/resend-otp', [CustomerSignupController::class, 'resendOtp'])
        ->name('customer.signup.resend-otp');
    
    Route::post('customer/signup/complete', [CustomerSignupController::class, 'completeSignup'])
        ->name('customer.signup.complete');
});
```

---

## Key Features

### 1. UITM Email Validation
- Automatically detects UITM members based on @uitm.edu.my domain
- Enforces strict domain matching for UITM selection
- Clear error messages for mismatched email domains

### 2. OTP Management
- 6-digit random OTP generation
- Secure hashing (bcrypt)
- Configurable expiry (default: 10 minutes)
- Automatic cleanup of expired OTPs
- Rate limiting on resends

### 3. Security
- Email verification for UITM users only
- Strong password requirements:
  - Minimum 8 characters
  - Uppercase, number, special character
- CSRF protection on all endpoints
- Password hashing with bcrypt
- SQL injection prevention via validation
- XSS protection via Inertia/React

### 4. User Experience
- Visual step indicators
- Clear status messages
- Customer type selection with descriptions
- Dynamic form flow (OTP shown only for UITM)
- Resend OTP functionality
- Error messages with helpful guidance

### 5. Data Integrity
- Email uniqueness validation
- Phone format validation
- Password confirmation matching
- OTP attempt tracking
- Automatic logout after OTP expiry

---

## Testing Checklist

### UITM Flow
- [ ] Valid @uitm.edu.my signup with OTP
- [ ] Resend OTP functionality
- [ ] Max OTP attempts (5)
- [ ] Expired OTP handling
- [ ] Email domain validation
- [ ] Account created with UITM flags set
- [ ] Auto-login after signup

### Non-UITM Flow
- [ ] Non-@uitm email signup (skips OTP)
- [ ] Account created with Non-UITM flags
- [ ] No OTP screen shown
- [ ] Auto-login after signup

### Edge Cases
- [ ] Duplicate email handling
- [ ] Invalid phone numbers
- [ ] Password strength validation
- [ ] CSRF token validation
- [ ] Rate limiting on resend
- [ ] Terms & conditions validation

---

## Configuration

Update in `.env` if needed:
```env
MAIL_FROM_ADDRESS=noreply@unispa.local
MAIL_FROM_NAME="UniSpa"
```

Update `config/auth.php` if using custom auth settings.

---

## Future Enhancements

1. **Email Verification for Non-UITM**: Add optional email verification for non-UITM users
2. **Google OAuth**: Integrate Google login as alternative
3. **SMS OTP**: Support SMS-based OTP for users without email
4. **UTM ID Capture**: Add optional UTM ID field for UITM members
5. **Social Login**: Add Facebook, WhatsApp integration
6. **Two-Factor Authentication**: Additional security layer
7. **Email Templates**: Beautiful HTML email templates with branding

---

## Troubleshooting

### OTP Not Received
- Check MAIL configuration in `.env`
- Verify email address is correct
- Check spam/junk folder
- Resend OTP (max 3 times per 5 minutes)

### "Email Already Exists"
- Use different email address
- If account lost password, use "Forgot Password" flow

### OTP Verification Failed
- Check OTP hasn't expired (valid for 10 min)
- Verify you entered correct OTP
- Check remaining attempts (max 5)

### Account Creation Failed
- Ensure all fields are filled correctly
- Check password meets strength requirements
- Verify terms & conditions are accepted
- Check email is not already registered

---

**Version:** 1.0  
**Last Updated:** 2026-01-05  
**Maintainer:** Development Team
