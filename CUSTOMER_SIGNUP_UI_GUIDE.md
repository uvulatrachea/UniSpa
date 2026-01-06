# UniSpa Customer Signup UI/UX Guide

## Overview
Complete visual guide for the customer signup flow with UITM and Non-UITM member support.

---

## Landing Page (Before Signup)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                   UniSpa                                │
│              Spa Management System                      │
│                                                         │
│         [ Login ]        [ Sign Up ]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Step 1: Registration Info Page

### Layout
```
┌─────────────────────────────────────────────────────────┐
│                    UniSpa                               │
│                                                         │
│               Create Your Account                       │
│                                                         │
│ ① Info ─────── ② Password                             │
│ (active)       (inactive)                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [ Email Signup ]  [ Google Signup ]                    │
│   (selected)      (unselected)                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Full Name *                                            │
│ ┌─────────────────────────────────────────────┐       │
│ │ John Doe                                    │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
│ Email Address *                                        │
│ ┌─────────────────────────────────────────────┐       │
│ │ student@uitm.edu.my                         │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
│ Phone Number *                                         │
│ ┌─────────────────────────────────────────────┐       │
│ │ +60 10 1234 5678                            │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
│ Customer Type *                                        │
│ ┌─ ◉ UITM Member ──────────────────────────────┐    │
│ │   Student or Staff with @uitm.edu.my email  │     │
│ └───────────────────────────────────────────────┘    │
│                                                         │
│ ┌─ ○ Non-UITM Customer ────────────────────────┐    │
│ │   General public or external customers      │     │
│ └───────────────────────────────────────────────┘    │
│                                                         │
│ [ Continue ]                                          │
│                                                         │
│ ─────────── or ───────────                           │
│                                                         │
│ Already have an account? Sign In                       │
│                                                         │
└─────────────────────────────────────────────────────────┘

For staff and admin signup, please use different access
```

### Form States

**Valid (Filled):**
```
Full Name: ✓ John Doe
Email: ✓ student@uitm.edu.my
Phone: ✓ +60 10 1234 5678
Customer Type: ◉ UITM Member
Button: [ Continue ] (enabled, blue)
```

**Invalid Email Domain for UITM:**
```
Email: john@gmail.com (with border-red-500)
⚠ For UITM members, please use your @uitm.edu.my email address
```

**Invalid Phone:**
```
Phone: 123 (with border-red-500)
⚠ Phone number must be at least 10 digits
```

---

## Step 2: Email Verification Page (UITM Only)

### Layout (When UITM Selected)
```
┌─────────────────────────────────────────────────────────┐
│                    UniSpa                               │
│                                                         │
│               Create Your Account                       │
│                                                         │
│ ① Info ─────── ② OTP ─────── ③ Password              │
│ (done)          (active)       (inactive)              │
│ [✓]             [2]            [3]                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ ℹ️ Information ─────────────────────────────────┐   │
│ │ ✓ A verification code has been sent to          │   │
│ │   student@uitm.edu.my                           │   │
│ │                                                  │   │
│ │ It will expire in 10 minutes                     │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ Enter 6-Digit OTP *                                    │
│ ┌──┬──┬──┬──┬──┬──┐                                   │
│ │  │  │  │  │  │  │  (6 separate boxes)              │
│ └──┴──┴──┴──┴──┴──┘                                   │
│                                                         │
│ [ Verify OTP ]                                        │
│ [ Resend OTP ]                                        │
│ [ Back to Info ]                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### OTP States

**Valid OTP Entered:**
```
OTP: [1] [2] [3] [4] [5] [6] (all boxes filled, green border)
Button: [ Verify OTP ] (enabled, blue)
```

**Invalid OTP:**
```
OTP: [1] [2] [3] [4] [5] [6] (with red border)
⚠ Invalid OTP. Please try again.
Attempts left: 3
```

**Expired OTP:**
```
⚠ OTP has expired. Please request a new one.
Button: [ Back to Info ] - forces restart
```

**Rate Limited Resend:**
```
⚠ Too many OTP requests. Please wait 5 minutes.
```

---

## Step 3: Password Creation Page

### Layout (For Both UITM & Non-UITM)

#### UITM Path (With OTP):
```
┌─────────────────────────────────────────────────────────┐
│                    UniSpa                               │
│                                                         │
│               Create Your Account                       │
│                                                         │
│ ① Info ─────── ② OTP ─────── ③ Password              │
│ (done)          (done)         (active)                │
│ [✓]             [✓]            [3]                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ ✓ Success ──────────────────────────────────────┐   │
│ │ Email verified successfully!                      │   │
│ │ Now create a secure password.                     │   │
│ └───────────────────────────────────────────────────┘   │
│                                                         │
│ Password *                                             │
│ ┌─────────────────────────────────────────────┐       │
│ │ ••••••••••••                                │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
│ Password Requirements:                                 │
│ ☑ At least 8 characters                              │
│ ☑ At least 1 uppercase letter (A-Z)                  │
│ ☑ At least 1 number (0-9)                            │
│ ☑ At least 1 special character (!@#$%)               │
│                                                         │
│ Confirm Password *                                     │
│ ┌─────────────────────────────────────────────┐       │
│ │ ••••••••••••                                │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
│ ☑ I agree to the Terms & Conditions                  │
│                                                         │
│ [ Create Account ]                                    │
│ [ Back to OTP ]                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Non-UITM Path (Skip OTP):
```
┌─────────────────────────────────────────────────────────┐
│                    UniSpa                               │
│                                                         │
│               Create Your Account                       │
│                                                         │
│ ① Info ─────── ② Password                             │
│ (done)         (active)                                │
│ [✓]            [2]                                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ ℹ️ Information ──────────────────────────────────┐   │
│ │ Welcome! Please create a secure password to      │   │
│ │ complete your account.                           │   │
│ └───────────────────────────────────────────────────┘   │
│                                                         │
│ [Same password form as above]                         │
│                                                         │
│ ☑ I agree to the Terms & Conditions                  │
│                                                         │
│ [ Create Account ]                                    │
│                                                         │
│ (No "Back to OTP" button - OTP was skipped)          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Password Validation Indicators

**Weak Password:**
```
Password: weak
Indicators:
☐ At least 8 characters (not met)
☐ At least 1 uppercase letter (not met)
☐ At least 1 number (not met)
☐ At least 1 special character (not met)
```

**Partial Strength:**
```
Password: Password12
Indicators:
☑ At least 8 characters (met) ✓
☑ At least 1 uppercase letter (met) ✓
☑ At least 1 number (met) ✓
☐ At least 1 special character (not met)
```

**Strong Password:**
```
Password: SecurePass123!
Indicators:
☑ At least 8 characters (met) ✓
☑ At least 1 uppercase letter (met) ✓
☑ At least 1 number (met) ✓
☑ At least 1 special character (met) ✓
Button: [ Create Account ] (enabled, blue)
```

---

## Mobile Responsive Views

### Mobile Step 1 (Info Page)
```
┌──────────────────────┐
│ UniSpa               │
│ Spa Management       │
│                      │
│ Create Your Account  │
│                      │
│ ① ── ② ── ③         │
│ (condensed)          │
│                      │
│ [Email][Google]      │
│ (tabs stacked)       │
│                      │
│ Full Name *          │
│ ┌────────────────┐   │
│ │                │   │
│ └────────────────┘   │
│                      │
│ Email Address *      │
│ ┌────────────────┐   │
│ │                │   │
│ └────────────────┘   │
│                      │
│ Phone Number *       │
│ ┌────────────────┐   │
│ │                │   │
│ └────────────────┘   │
│                      │
│ Customer Type *      │
│ ┌─ ◉ UITM ────┐     │
│ │ Student/    │     │
│ │ Staff       │     │
│ └─────────────┘     │
│ ┌─ ○ Non-UITM ┐    │
│ │ Public      │     │
│ └─────────────┘     │
│                      │
│ [ Continue ]         │
│                      │
│ Already registered?  │
│ Sign In              │
│                      │
└──────────────────────┘
```

---

## Error Message States

### Form-Level Errors

**Missing Required Field:**
```
Full Name field is empty (red border)
⚠️ Full name is required
```

**Validation Error:**
```
Email: user@gmail.com
Customer Type: UITM Member (selected)
⚠️ For UITM members, please use your @uitm.edu.my email address
```

**Backend Error:**
```
⚠️ This email is already registered. Please use a different email.
```

### OTP Errors

**Invalid Code:**
```
OTP Input (red border)
⚠️ Invalid OTP. Please try again.
Attempts remaining: 3
```

**Expired:**
```
⚠️ OTP has expired. Please request a new one.
[Back to Info] button
```

**Rate Limited:**
```
⚠️ Too many failed attempts. Please wait before trying again.
```

---

## Success States

### After OTP Verification
```
┌─ ✓ Email Verified ────────────────────┐
│ Your email has been verified!         │
│ Now create a secure password.         │
└───────────────────────────────────────┘
(Green background, green text)
```

### Account Creation Success
```
Redirecting to dashboard...

or

Dashboard loaded with:
- Welcome message
- User profile info
- Booking options
```

---

## Accessibility Features

### Keyboard Navigation
- Tab through fields in order
- Enter to submit forms
- Space to toggle radio buttons
- Tab to focus buttons

### Screen Reader Support
```html
<label htmlFor="email" className="sr-only">Email Address</label>
<input id="email" aria-label="Email Address" ... />

<div role="alert" aria-live="polite">
  {errors.email && <p>{errors.email}</p>}
</div>
```

### Color Contrast
- Text on white: #1f2937 (dark gray) - 16.33:1
- Error red: #ef4444 - 5.5:1 against white
- Success green: #22c55e - 4.7:1 against white
- Links: #9333ea (purple) - 4.8:1

### Focus States
```css
input:focus {
  outline: 2px solid #9333ea;
  outline-offset: 2px;
}

button:focus {
  ring: 2px solid #9333ea;
  ring-offset: 2px;
}
```

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 640px | Single column, stacked buttons |
| Tablet | 640px - 1024px | Single column with padding |
| Desktop | > 1024px | Centered container, max 500px |

---

## Color Scheme

| Element | Color | Hex |
|---------|-------|-----|
| Primary Button | Purple | #9333ea |
| Secondary Button | Gray | #f3f4f6 |
| Error | Red | #ef4444 |
| Success | Green | #22c55e |
| Info | Blue | #3b82f6 |
| Text | Dark Gray | #1f2937 |
| Light Text | Gray | #6b7280 |
| Borders | Light Gray | #e5e7eb |

---

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Main Heading | Inter | 32px | 700 |
| Section Title | Inter | 20px | 700 |
| Label | Inter | 14px | 500 |
| Input Text | Inter | 16px | 400 |
| Helper Text | Inter | 12px | 400 |
| Button | Inter | 16px | 500 |

---

## Email Verification Template

```
┌─────────────────────────────────────┐
│          UniSpa Logo                │
├─────────────────────────────────────┤
│                                     │
│   Email Verification for Signup     │
│                                     │
│   Hi John,                          │
│                                     │
│   Your verification code is:        │
│                                     │
│   ┌─────────────┐                  │
│   │  1 2 3 4 5 6│                  │
│   └─────────────┘                  │
│                                     │
│   This code expires in 10 minutes.  │
│                                     │
│   If you didn't request this code,  │
│   you can ignore this email.        │
│                                     │
│   Best regards,                     │
│   UniSpa Team                       │
│                                     │
├─────────────────────────────────────┤
│   © 2026 UniSpa. All rights         │
│   reserved.                         │
└─────────────────────────────────────┘
```

---

## Animation & Transitions

### Form Transitions
- Step change: fade out form → fade in new form (300ms)
- Error appearance: slide down (200ms)
- Success message: fade in (150ms)

### Button States
- Hover: background darkens 10%
- Active/Click: scale 0.98
- Disabled: opacity 0.5, cursor not-allowed

### Input Focus
- Border color change: 200ms
- Box shadow: 200ms
- Outline pulse on error: 1s infinite

---

## Form Submission Flow

### Before Submit
```
User fills form → All fields valid
Button enabled (blue, clickable)
```

### During Submit
```
Button text: "Checking..." / "Verifying..." / "Creating..."
Button disabled (gray, not clickable)
Button shows spinner/loading state
```

### After Submit Success
```
Show success message
Redirect to next step or dashboard
Clear form
```

### After Submit Error
```
Show error message (red box)
Button re-enabled
Form data preserved
User can correct and resubmit
```

---

**Version:** 1.0  
**Last Updated:** 2026-01-05
