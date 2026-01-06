# 🎯 VISUAL FLOW DIAGRAMS

## Login Flow - Email Based

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER LOGIN FLOW                       │
└─────────────────────────────────────────────────────────────┘

START
  │
  ├─→ Visit /customer/auth/login
  │   Display: Email & Google tabs
  │
  ├─→ User chooses "Email Login"
  │
  ├─→ USER ENTERS EMAIL
  │   │
  │   ├─→ Validation:
  │   │   • Email format check
  │   │   • Customer exists check
  │   │
  │   ├─→ SEND OTP BUTTON
  │       ├─→ Generate 6-digit OTP
  │       ├─→ Hash OTP (bcrypt)
  │       ├─→ Store in otp_verifications table
  │       │   - expires_at = now + 10 minutes
  │       │   - attempts = 0
  │       ├─→ Send email with plain OTP
  │       └─→ Show "OTP sent to email"
  │
  ├─→ USER RECEIVES EMAIL
  │   Display: OTP code (6 digits)
  │   Expires in 10 minutes
  │
  ├─→ USER ENTERS OTP
  │   ├─→ 6 digit input boxes
  │   ├─→ Only numbers allowed
  │   │
  │   ├─→ VERIFY BUTTON
  │       ├─→ Get OTP record from DB
  │       │
  │       ├─→ Check expiration
  │       │   ├─→ Expired? → Delete record, show error
  │       │   └─→ Valid? → Continue
  │       │
  │       ├─→ Check attempts (max 5)
  │       │   ├─→ >= 5 attempts? → Delete record, show error
  │       │   └─→ < 5 attempts? → Continue
  │       │
  │       ├─→ Hash::check(input_otp, stored_otp)
  │       │   ├─→ Doesn't match?
  │       │   │   ├─→ Increment attempts
  │       │   │   ├─→ Show error "Invalid OTP"
  │       │   │   └─→ Show remaining attempts
  │       │   │
  │       │   └─→ Matches?
  │       │       ├─→ Update customer:
  │       │       │   is_email_verified = true
  │       │       │
  │       │       ├─→ Delete OTP record
  │       │       │
  │       │       ├─→ auth('customer')->login($customer)
  │       │       │   ├─→ Create session
  │       │       │   └─→ Set auth cookie
  │       │       │
  │       │       ├─→ Redirect to /dashboard
  │       │       │
  │       │       └─→ SUCCESS! ✓
  │
  └─→ END

ERROR PATHS:
  • Email not found → Show "Email not registered"
  • Expired OTP → Show "OTP expired, request new"
  • 5 failed attempts → Show "Too many attempts, request new OTP"
  • CSRF error → Show "Security error, try again"
```

---

## Login Flow - Google OAuth

```
┌─────────────────────────────────────────────────────────────┐
│              CUSTOMER GOOGLE LOGIN FLOW                      │
└─────────────────────────────────────────────────────────────┘

START
  │
  ├─→ Visit /customer/auth/login
  │   Display: Email & Google tabs
  │
  ├─→ User chooses "Google Login"
  │
  ├─→ Click "Sign in with Google" button
  │   │
  │   ├─→ Redirect to: /customer/auth/google
  │   │
  │   └─→ Socialite::driver('google')->redirect()
  │       └─→ Redirects to Google login page
  │
  ├─→ USER LOGS IN TO GOOGLE
  │   Enter Google credentials
  │
  ├─→ Google redirects back to
  │   /customer/auth/google/callback
  │   └─→ With authorization code
  │
  ├─→ Get Google User Data
  │   └─→ $googleUser = Socialite::driver('google')->user()
  │       Returns:
  │       • getId()      → Google ID
  │       • getName()    → Full name
  │       • getEmail()   → Email
  │
  ├─→ Find or Create Customer
  │   │
  │   ├─→ Check: WHERE google_id = $googleUser->getId()
  │   │   │
  │   │   ├─→ Found existing customer?
  │   │   │   └─→ Use existing customer
  │   │   │
  │   │   └─→ Not found?
  │   │       │
  │   │       ├─→ Check: WHERE email = $googleUser->getEmail()
  │   │       │   │
  │   │       │   ├─→ Email exists? (signed up with email before)
  │   │       │   │   └─→ Link Google ID to existing account
  │   │       │   │
  │   │       │   └─→ Email doesn't exist?
  │   │       │       └─→ Create new customer:
  │   │       │           customer_id = CUST-{UUID}
  │   │       │           name = $googleUser->getName()
  │   │       │           email = $googleUser->getEmail()
  │   │       │           google_id = $googleUser->getId()
  │   │       │           is_email_verified = true
  │   │       │           auth_method = 'google'
  │   │       │           profile_completed = false
  │   │       │           (no password set)
  │   │
  │   └─→ $customer now exists
  │
  ├─→ Authenticate Customer
  │   │
  │   ├─→ auth('customer')->login($customer)
  │   │   ├─→ Create session
  │   │   └─→ Set auth cookie
  │   │
  │   └─→ Redirect to /dashboard
  │
  └─→ SUCCESS! ✓

ERROR PATHS:
  • Google denies access → Show "Google sign-in cancelled"
  • Network error → Show "Unable to authenticate with Google"
  • Database error → Show "System error, please try again"
```

---

## Signup Flow - Email Based

```
┌─────────────────────────────────────────────────────────────┐
│               CUSTOMER EMAIL SIGNUP FLOW                     │
└─────────────────────────────────────────────────────────────┘

STEP 1: User Information
─────────────────────────

START
  │
  ├─→ Visit /customer/auth/signup
  │   Display: Progress bar (1 of 3)
  │   Display: Email & Google tabs
  │
  ├─→ Click "Email Signup" tab
  │
  ├─→ FORM: Full Name, Email, Phone
  │   │
  │   ├─→ User fills form
  │   │
  │   └─→ CONTINUE BUTTON
  │       │
  │       ├─→ Client validation:
  │       │   • Name not empty
  │       │   • Email format
  │       │   • Phone >= 10 digits
  │       │
  │       ├─→ Server validation (SendOtpRequest):
  │       │   • Email exists? → Error "Already registered"
  │       │   • Valid email format
  │       │
  │       ├─→ Generate & send OTP
  │       │   (same as login OTP process)
  │       │
  │       └─→ Move to STEP 2
  │

STEP 2: OTP Verification
────────────────────────

  ├─→ Progress bar (2 of 3)
  │   Show: "OTP sent to {email}"
  │
  ├─→ FORM: 6-digit OTP input
  │   │
  │   ├─→ User fills OTP
  │   │   ├─→ 6 digit boxes
  │   │   ├─→ Numbers only
  │   │   └─→ Auto-focus between boxes
  │   │
  │   └─→ VERIFY BUTTON
  │       │
  │       ├─→ Verify OTP (same as login):
  │       │   • Check expiration
  │       │   • Check attempts (max 5)
  │       │   • Hash::check()
  │       │
  │       ├─→ Success?
  │       │   └─→ Move to STEP 3
  │       │
  │       └─→ Failure?
  │           └─→ Show error
  │               └─→ Allow retry
  │

STEP 3: Password Creation
──────────────────────────

  ├─→ Progress bar (3 of 3)
  │   Show: "Create a strong password"
  │
  ├─→ FORM: Password Fields
  │   │
  │   ├─→ PASSWORD INPUT
  │   │   ├─→ Field with visibility toggle
  │   │   ├─→ Eye icon to show/hide
  │   │   │
  │   │   └─→ Real-time validator shows:
  │   │       ✓ At least 8 characters
  │   │       ✓ Uppercase letter (A-Z)
  │   │       ✓ Number (0-9)
  │   │       ✓ Special character (!@#$%)
  │   │       Overall: "Password is weak" | "Password is strong"
  │   │
  │   ├─→ CONFIRM PASSWORD INPUT
  │   │   ├─→ Field with visibility toggle
  │   │   └─→ Shows match status with main password
  │   │
  │   ├─→ TERMS CHECKBOX
  │   │   └─→ "I agree to Terms & Conditions"
  │   │
  │   └─→ CREATE ACCOUNT BUTTON
  │       │
  │       ├─→ Client validation:
  │       │   • Password meets all requirements
  │       │   • Passwords match
  │       │   • Terms checked
  │       │
  │       ├─→ Server validation (SignupRequest):
  │       │   • All above checks
  │       │   • Email not registered
  │       │   • OTP still valid
  │       │
  │       ├─→ Success?
  │       │   │
  │       │   ├─→ Hash password: Hash::make($password)
  │       │   │
  │       │   ├─→ Create customer record:
  │       │   │   customer_id = CUST-{UUID}
  │       │   │   name = from step 1
  │       │   │   email = from step 1
  │       │   │   phone = from step 1
  │       │   │   password = hashed
  │       │   │   is_email_verified = true
  │       │   │   auth_method = 'email'
  │       │   │   profile_completed = true
  │       │   │
  │       │   ├─→ Delete OTP record
  │       │   │
  │       │   ├─→ auth('customer')->login($customer)
  │       │   │   ├─→ Create session
  │       │   │   └─→ Set auth cookie
  │       │   │
  │       │   └─→ Redirect to /dashboard
  │       │       └─→ SUCCESS! ✓
  │       │
  │       └─→ Failure?
  │           └─→ Show error
  │               (email registered, OTP expired, etc.)
  │
  └─→ END
```

---

## Signup Flow - Google

```
┌─────────────────────────────────────────────────────────────┐
│              CUSTOMER GOOGLE SIGNUP FLOW                     │
└─────────────────────────────────────────────────────────────┘

START
  │
  ├─→ Visit /customer/auth/signup
  │   Display: Email & Google tabs
  │
  ├─→ Click "Google Signup" tab
  │
  ├─→ Click "Sign up with Google" button
  │   │
  │   ├─→ (Same as Google login flow)
  │   │   See: Google Login Flow diagram above
  │   │
  │   └─→ Creates customer with:
  │       • auth_method = 'google'
  │       • No password required
  │       • profile_completed = false
  │
  ├─→ Authenticate customer
  │   └─→ auth('customer')->login()
  │
  ├─→ Redirect to /dashboard
  │   (Optional: Can show "Complete your profile" prompt)
  │
  └─→ SUCCESS! ✓

FUTURE FLOW (Optional):
  • Prompt user to set password
  • Complete profile information
  • Verify phone number
```

---

## OTP Service Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    OTP SERVICE FLOW                          │
└─────────────────────────────────────────────────────────────┘

generateOtp()
──────────────
  random_int(0, 999999)
  → pad to 6 digits
  → "123456"


sendOtpForSignup(email, name)
──────────────────────────────
  Check: Customer exists?
    → Yes? Return false
    → No? Continue
  
  Generate OTP: "123456"
  
  Expires at: NOW + 10 minutes
  
  Store in otp_verifications:
  {
    email: "user@email.com"
    otp_token: Hash::make("123456")  // Hashed!
    expires_at: 2025-01-04 15:30:00
    attempts: 0
    type: "signup"
    signup_data: { name: "John" }
  }
  
  Send Email:
    To: user@email.com
    Subject: "UniSpa - Verify Your Email for Signup"
    Body: OTP code displayed


sendOtpForLogin(email)
──────────────────────
  Check: Customer exists?
    → No? Return false
    → Yes? Continue
  
  (Same process as sendOtpForSignup)


verifyOtp(email, otp)
─────────────────────
  Get record: WHERE email = ?
  
  Not found?
    → Return { success: false, message: "No OTP sent" }
  
  Check expiration:
    NOW > expires_at?
    → Yes? Delete record, return error
    → No? Continue
  
  Check attempts:
    attempts >= 5?
    → Yes? Delete record, return error
    → No? Continue
  
  Check OTP match:
    Hash::check(input_otp, stored_otp_hash)?
    → No? Increment attempts, return error
    → Yes? Return { success: true, type: '...', ... }


invalidateOtp(email)
────────────────────
  DELETE FROM otp_verifications WHERE email = ?


cleanupExpiredOtps()
────────────────────
  DELETE FROM otp_verifications WHERE expires_at < NOW
  (Run periodically via cron/scheduler)
```

---

## Database Schema Flow

```
┌──────────────────────┐
│    otp_verifications │
├──────────────────────┤
│ id (PK)              │
│ email (UQ)           │◄──┐
│ otp_token (hashed)   │   │
│ expires_at           │   │
│ attempts             │   │
│ type                 │   │
│ signup_data (JSON)   │   │
│ created_at           │   │
│ updated_at           │   │
└──────────────────────┘   │
                           │
┌──────────────────────┐   │
│    customer          │   │
├──────────────────────┤   │
│ customer_id (PK)     │   │
│ name                 │   │
│ email (UQ)           │   │
│ phone                │   │
│ password (nullable)  │   │
│ google_id (UQ)       │   │
│ otp_token (temp)     ├───┤
│ otp_expires_at       │
│ is_email_verified    │
│ auth_method          │
│ profile_completed    │
│ created_at           │
└──────────────────────┘

Flow:
1. Signup with email → Store in otp_verifications
2. Verify OTP → Still in otp_verifications
3. Create password → Create customer, delete from otp_verifications
4. Login with email → Generate OTP, store in otp_verifications
5. Verify login OTP → Delete from otp_verifications

Google signup → Directly create customer
```

---

## Password Validation Flow

```
┌──────────────────────────────────────────────┐
│     PASSWORD VALIDATION FLOW                 │
└──────────────────────────────────────────────┘

USER TYPES PASSWORD
  │
  └─→ onChange event triggered
      │
      ├─→ Frontend JavaScript:
      │   │
      │   ├─→ Check length >= 8
      │   │   ├─→ true? Show ✓ (green)
      │   │   └─→ false? Show ○ (gray)
      │   │
      │   ├─→ Check /[A-Z]/.test()
      │   │   ├─→ true? Show ✓ (green)
      │   │   └─→ false? Show ○ (gray)
      │   │
      │   ├─→ Check /[0-9]/.test()
      │   │   ├─→ true? Show ✓ (green)
      │   │   └─→ false? Show ○ (gray)
      │   │
      │   ├─→ Check /[!@#$%^&*...]/.test()
      │   │   ├─→ true? Show ✓ (green)
      │   │   └─→ false? Show ○ (gray)
      │   │
      │   └─→ Check password === confirm_password
      │       ├─→ true? Show ✓ (green)
      │       └─→ false? Show ○ (gray)
      │
      ├─→ Update UI in real-time
      │   ├─→ All green? → "Password is strong" ✓
      │   └─→ Some gray? → "Password is weak" ✗
      │
      └─→ If all requirements met:
          └─→ Enable "Create Account" button


USER SUBMITS FORM
  │
  └─→ Server validation (SignupRequest):
      │
      ├─→ password.required
      ├─→ password.min:8
      ├─→ password.regex:/[A-Z]/
      ├─→ password.regex:/[0-9]/
      ├─→ password.regex:/[!@#$%^&*]/
      ├─→ password_confirmation.same:password
      │
      └─→ All pass?
          ├─→ YES? Create account
          └─→ NO? Return errors
```

---

## Session & Auth Flow

```
┌──────────────────────────────────────────────┐
│      SESSION & AUTHENTICATION FLOW           │
└──────────────────────────────────────────────┘

LOGIN SUCCESS
  │
  ├─→ auth('customer')->login($customer)
  │   │
  │   ├─→ Creates session in Laravel
  │   ├─→ Stores customer_id in session
  │   ├─→ Creates session cookie
  │   └─→ Marks session as authenticated
  │
  ├─→ Redirect to /dashboard
  │
  └─→ Browser receives:
      • Set-Cookie: LARAVEL_SESSION=...
      • Location: /dashboard


SUBSEQUENT REQUESTS
  │
  ├─→ Browser sends session cookie
  │   LARAVEL_SESSION=...
  │
  ├─→ Laravel middleware checks:
  │   • Session cookie valid?
  │   • Session data exists?
  │   • Customer in database?
  │
  ├─→ Sets auth('customer') context
  │   └─→ Can use: auth('customer')->user()
  │
  └─→ Process request


LOGOUT
  │
  ├─→ POST /customer/auth/logout
  │
  ├─→ auth('customer')->logout()
  │   │
  │   ├─→ Removes session data
  │   ├─→ Invalidates session cookie
  │   └─→ Clears auth context
  │
  └─→ Redirect to /customer/auth/login
```

---

These diagrams show the complete flow of the authentication system!
