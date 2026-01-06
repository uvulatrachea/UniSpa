# ✅ IMPLEMENTATION CHECKLIST

Use this checklist to track your setup progress.

---

## PART 1: INSTALL PACKAGES

- [ ] Run: `composer require laravel/socialite`
- [ ] Verify Socialite installed: `composer show | grep socialite`

---

## PART 2: DATABASE

- [ ] Run migrations: `php artisan migrate`
- [ ] Verify `customer` table has new columns (SQL query or DB admin):
  - [ ] `otp_token`
  - [ ] `otp_expires_at`
  - [ ] `is_email_verified`
  - [ ] `google_id`
  - [ ] `auth_method`
  - [ ] `profile_completed`
- [ ] Verify `otp_verifications` table created

---

## PART 3: ENVIRONMENT SETUP

- [ ] Open `.env` file
- [ ] Add Google OAuth credentials:
  - [ ] `GOOGLE_CLIENT_ID=...`
  - [ ] `GOOGLE_CLIENT_SECRET=...`
  - [ ] `GOOGLE_REDIRECT_URI=http://localhost:8000/customer/auth/google/callback`
- [ ] Add Email configuration:
  - [ ] `MAIL_MAILER=smtp`
  - [ ] `MAIL_HOST=smtp.gmail.com` (or your provider)
  - [ ] `MAIL_PORT=587`
  - [ ] `MAIL_USERNAME=...`
  - [ ] `MAIL_PASSWORD=...`
  - [ ] `MAIL_FROM_ADDRESS=noreply@unispa.local`
  - [ ] `MAIL_FROM_NAME=UniSpa`

---

## PART 4: GOOGLE OAUTH SETUP (Optional but Recommended)

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create new project or select existing
- [ ] Search for "Google+ API" and enable it
- [ ] Go to "Credentials" section
- [ ] Click "Create Credentials" → "OAuth 2.0 Client IDs"
- [ ] Select "Web application"
- [ ] Add authorized redirect URIs:
  - [ ] `http://localhost:8000/customer/auth/google/callback`
  - [ ] `https://yourdomain.com/customer/auth/google/callback` (for production)
- [ ] Copy "Client ID" to `GOOGLE_CLIENT_ID` in `.env`
- [ ] Copy "Client Secret" to `GOOGLE_CLIENT_SECRET` in `.env`

---

## PART 5: EMAIL SETUP (Optional but Recommended)

### Option A: Gmail
- [ ] Enable 2-factor authentication on Google account
- [ ] Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
- [ ] Select "Mail" and "Windows Computer (or other)"
- [ ] Copy 16-character password
- [ ] Add to `.env`:
  ```
  MAIL_MAILER=smtp
  MAIL_HOST=smtp.gmail.com
  MAIL_PORT=587
  MAIL_USERNAME=your-email@gmail.com
  MAIL_PASSWORD=paste-16-char-password
  MAIL_ENCRYPTION=tls
  ```

### Option B: MailHog (for local testing)
- [ ] Install Docker or use Docker Desktop
- [ ] Run: `docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog`
- [ ] Add to `.env`:
  ```
  MAIL_MAILER=smtp
  MAIL_HOST=127.0.0.1
  MAIL_PORT=1025
  MAIL_USERNAME=null
  MAIL_PASSWORD=null
  MAIL_ENCRYPTION=null
  ```
- [ ] Access at: http://localhost:8025

### Option C: Other Provider
- [ ] Follow your provider's documentation
- [ ] Add credentials to `.env`

---

## PART 6: CACHE CLEARING

- [ ] Run: `php artisan cache:clear`
- [ ] Run: `php artisan config:clear`
- [ ] Run: `php artisan view:clear`

---

## PART 7: FILE VERIFICATION

### Backend Files
- [ ] `app/Models/Customer.php` - Updated with OTP fields
- [ ] `app/Models/OtpVerification.php` - Exists
- [ ] `app/Http/Controllers/Auth/CustomerAuthController.php` - Exists
- [ ] `app/Http/Requests/Auth/SendOtpRequest.php` - Exists
- [ ] `app/Http/Requests/Auth/VerifyOtpRequest.php` - Exists
- [ ] `app/Http/Requests/Auth/SignupRequest.php` - Exists
- [ ] `app/Services/OtpService.php` - Exists
- [ ] `app/Mail/SendOtpEmail.php` - Exists
- [ ] `resources/views/emails/otp.blade.php` - Exists
- [ ] `database/migrations/2025_01_04_000000_...` - Exists
- [ ] `database/migrations/2025_01_04_000001_...` - Exists
- [ ] `routes/auth.php` - Updated with customer routes
- [ ] `config/auth.php` - Updated with customer guard
- [ ] `config/services.php` - Updated with Google config

### Frontend Files
- [ ] `resources/js/Pages/Auth/CustomerLogin.jsx` - Exists
- [ ] `resources/js/Pages/Auth/CustomerSignup.jsx` - Exists
- [ ] `resources/js/Components/Auth/PasswordInput.jsx` - Exists
- [ ] `resources/js/Components/Auth/PasswordValidator.jsx` - Exists
- [ ] `resources/js/Components/Auth/GoogleButton.jsx` - Exists
- [ ] `resources/js/Components/Auth/OtpInput.jsx` - Exists
- [ ] `resources/js/Layouts/GuestLayout.jsx` - Already exists (no changes)

### Documentation Files
- [ ] `AUTHENTICATION_SETUP.md` - Created
- [ ] `AUTH_QUICK_REFERENCE.md` - Created
- [ ] `FILE_LOCATIONS.md` - Created
- [ ] `.env.example.auth` - Created

---

## PART 8: TESTING

### Test Email Login Flow
- [ ] Go to: `http://localhost:8000/customer/auth/login`
- [ ] Click "Email Login" tab
- [ ] Enter registered customer email
- [ ] Click "Send OTP"
- [ ] Check email for OTP (or MailHog at http://localhost:8025)
- [ ] Copy OTP code
- [ ] Paste OTP in form
- [ ] Click "Verify OTP"
- [ ] Should be logged in and redirected to dashboard

### Test Email Signup Flow
- [ ] Go to: `http://localhost:8000/customer/auth/signup`
- [ ] Click "Email Signup" tab
- [ ] Fill in: Name, Email, Phone
- [ ] Click "Continue with Email"
- [ ] Enter OTP from email
- [ ] Click "Verify OTP"
- [ ] Create password with requirements:
  - [ ] At least 8 characters
  - [ ] Uppercase letter
  - [ ] Number
  - [ ] Special character
- [ ] Confirm password matches
- [ ] Check terms checkbox
- [ ] Click "Create Account"
- [ ] Should be logged in and redirected to dashboard

### Test Google Login/Signup
- [ ] Go to: `http://localhost:8000/customer/auth/login`
- [ ] Click "Google Login" tab
- [ ] Click "Sign in with Google"
- [ ] Log in with your Google account
- [ ] Should be logged in and redirected to dashboard
- [ ] Repeat with signup page for new account

### Test Password Strength Validator
- [ ] Go to signup page
- [ ] Start typing in password field
- [ ] Watch requirements update in real-time:
  - [ ] Length requirement shows
  - [ ] Uppercase requirement shows
  - [ ] Number requirement shows
  - [ ] Special character requirement shows
- [ ] Overall status shows "Password is weak" until all met
- [ ] Once all met, shows "Password is strong"

### Test Password Visibility Toggle
- [ ] In password field, click eye icon
- [ ] Password text becomes visible
- [ ] Click again, text is hidden
- [ ] Works in both login and signup

### Test OTP Validation
- [ ] Send OTP
- [ ] Enter wrong OTP
- [ ] Should show error
- [ ] Try 5 times
- [ ] After 5th attempt, should ask to request new OTP
- [ ] Wait 10 minutes for OTP to expire naturally
- [ ] Expired OTP should not work

---

## PART 9: CUSTOMIZATION (Optional)

- [ ] Customize email template: `resources/views/emails/otp.blade.php`
- [ ] Change OTP validity: `app/Services/OtpService.php` (line 17)
- [ ] Change max attempts: `app/Services/OtpService.php` (line 18)
- [ ] Change password requirements: Update regex in validation & React component
- [ ] Customize styling: Update Tailwind classes in React components
- [ ] Change redirect after login: `CustomerAuthController.php` (line 130)

---

## PART 10: PRODUCTION SETUP (When Ready)

- [ ] Use real domain in `GOOGLE_REDIRECT_URI`
- [ ] Update Google OAuth with production redirect URI
- [ ] Use production email service (not MailHog)
- [ ] Set secure session config in `.env`
- [ ] Enable HTTPS
- [ ] Set `APP_DEBUG=false`
- [ ] Set `APP_ENV=production`
- [ ] Review `.env` for any test/debug values

---

## 🎉 DONE!

Once all checkboxes are checked:
- ✅ System is fully implemented
- ✅ All features working
- ✅ Ready for production

If any tests fail:
1. Check `storage/logs/laravel.log` for errors
2. Review the component code
3. Verify `.env` configuration
4. Ensure migrations ran successfully
5. Verify Google credentials are correct

**Congratulations! Your customer authentication system is live!** 🚀

---

## 📞 TROUBLESHOOTING QUICK LINKS

- **OTP not sending:** Check MAIL_* config in `.env`
- **Google login fails:** Verify Google credentials and redirect URI
- **Password validation failing:** Check regex patterns in validation
- **CSRF errors:** Clear cache with `php artisan cache:clear`
- **Routes not found:** Verify `routes/auth.php` updated correctly
- **Database errors:** Check migrations ran successfully

See `AUTHENTICATION_SETUP.md` for detailed troubleshooting.
