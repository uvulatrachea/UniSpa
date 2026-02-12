import { useForm, Head, Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { useState, useRef, useEffect } from 'react';

export default function VerifyOtp({ email }) {
  const OTP_LENGTH = 6;
  const inputRefs = useRef([]);
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const { data, setData, post, processing, errors } = useForm({
    email: email,
    otp_code: '',
  });

  const resendOtp = () => {
    setResending(true);
    setResendMsg('');
    router.post(route('verify.otp.resend'), { email }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setResendMsg('A new OTP has been sent to your email.');
        setResending(false);
      },
      onError: () => {
        setResendMsg('Failed to resend OTP. Please try again.');
        setResending(false);
      },
    });
  };

  /* keep form data in sync */
  useEffect(() => {
    setData('otp_code', digits.join(''));
  }, [digits]);

  /* auto-focus first input */
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  /* ---- input handlers ---- */
  const handleChange = (idx, value) => {
    if (!/^\d?$/.test(value)) return;            // digits only
    const next = [...digits];
    next[idx] = value;
    setDigits(next);
    if (value && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => (next[i] = ch));
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const submit = (e) => {
    e.preventDefault();
    post(route('verify.otp'), {
      onSuccess: () => {
        setVerified(true);
        // Redirect to dashboard after successful verification
        router.visit(route('customer.dashboard'), { method: 'get' });
      },
    });
  };

  const maskedEmail = email
    ? email.replace(/^(.{3})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    : '';

  return (
    <GuestLayout wide>
      <Head title="Verify OTP" />

      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-unispa-surfaceAlt to-white">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex min-h-[540px]">

            {/* -------- LEFT PANEL -------- */}
            <div className="hidden md:flex w-2/5 bg-gradient-to-br from-unispa-primary to-unispa-primaryDark p-8 text-white flex-col">
              <div className="mb-10">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-unispa-primary font-bold text-xl">US</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">UniSpa</h1>
                    <p className="text-sm opacity-80">University Wellness Platform</p>
                  </div>
                </div>
                <p className="text-sm opacity-90 mt-4">
                  One more step to verify your email and complete registration.
                </p>
              </div>

              <div className="space-y-5 flex-1">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Account Created</h3>
                    <p className="text-sm opacity-80">Your details have been saved</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mt-1 flex-shrink-0">
                    <span className="text-xs font-bold text-unispa-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Verify Email</h3>
                    <p className="text-sm opacity-80">Enter the OTP sent to your email</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Start Booking</h3>
                    <p className="text-sm opacity-80">Explore wellness services</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/20">
                <p className="text-xs opacity-70 leading-relaxed">
                  Didn't receive an email? Check your spam folder or contact support at&nbsp;
                  <span className="underline">unispa@uitm.edu.my</span>
                </p>
              </div>
            </div>

            {/* -------- RIGHT PANEL -------- */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
              {verified ? (
                /* ---- SUCCESS STATE ---- */
                <div className="w-full max-w-sm text-center space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Email Verified!</h2>
                  <p className="text-slate-500 text-sm">
                    Your UiTM email has been verified successfully. You can now sign in to your account.
                  </p>
                  <Link
                    href={route('customer.login')}
                    className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-unispa-primary to-unispa-primaryDark px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition"
                  >
                    Sign In Now
                  </Link>
                </div>
              ) : (
                /* ---- OTP FORM ---- */
                <div className="w-full max-w-sm space-y-6">
                  {/* icon */}
                  <div className="mx-auto w-14 h-14 rounded-full bg-unispa-primary/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-unispa-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>

                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Verify Your Email</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      We sent a 6-digit code to
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{maskedEmail}</p>
                  </div>

                  <form onSubmit={submit} className="space-y-6">
                    {/* OTP digit boxes */}
                    <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
                      {digits.map((d, i) => (
                        <input
                          key={i}
                          ref={(el) => (inputRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          onChange={(e) => handleChange(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          className={`
                            w-11 h-13 sm:w-12 sm:h-14 rounded-xl border-2 text-center text-xl font-bold
                            transition-all duration-150 outline-none
                            ${d
                              ? 'border-unispa-primary bg-unispa-primary/5 text-slate-900'
                              : 'border-slate-200 bg-slate-50 text-slate-400'}
                            focus:border-unispa-primary focus:ring-2 focus:ring-unispa-primary/20
                          `}
                        />
                      ))}
                    </div>

                    <InputError message={errors.otp_code} className="text-center" />

                    {/* submit */}
                    <button
                      type="submit"
                      disabled={processing || digits.join('').length < OTP_LENGTH}
                      className="w-full rounded-xl bg-gradient-to-r from-unispa-primary to-unispa-primaryDark px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        'Verify & Continue'
                      )}
                    </button>

                    {/* resend / back */}
                    <div className="text-center space-y-3">
                      <p className="text-xs text-slate-400">
                        Didn't receive the code?{' '}
                        <button
                          type="button"
                          onClick={resendOtp}
                          disabled={resending}
                          className="text-unispa-primary font-semibold hover:underline disabled:opacity-50"
                        >
                          {resending ? 'Sending...' : 'Resend OTP'}
                        </button>
                      </p>
                      {resendMsg && (
                        <p className="text-xs text-green-600 font-medium">{resendMsg}</p>
                      )}
                      <Link
                        href={route('customer.login')}
                        className="inline-block text-xs text-slate-400 hover:text-slate-600 transition"
                      >
                        &larr; Back to Sign In
                      </Link>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
