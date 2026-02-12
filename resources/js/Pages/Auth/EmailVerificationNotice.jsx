import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function EmailVerificationNotice({ email }) {
  const { post, processing, success, error } = useForm({});

  const resendVerification = (e) => {
    e.preventDefault();
    post(route('verification.resend'), {
      data: { email },
      preserveState: true,
    });
  };

  const maskedEmail = email
    ? email.replace(/^(.{3})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    : '';

  return (
    <GuestLayout wide>
      <Head title="Verify Your Email" />
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-unispa-surfaceAlt to-white">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex min-h-[500px]">
            {/* Left Panel */}
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
                  We've sent a verification link to your email address.
                </p>
              </div>

              <div className="space-y-5 flex-1">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Check Your Email</h3>
                    <p className="text-sm opacity-80">Look for our email</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Click Verify</h3>
                    <p className="text-sm opacity-80">Use the button in email</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Start Booking</h3>
                    <p className="text-sm opacity-80">Access all features</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/20">
                <p className="text-xs opacity-70 leading-relaxed">
                  Need help? Contact us at&nbsp;
                  <span className="underline">unispa@uitm.edu.my</span>
                </p>
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
              <div className="w-full max-w-sm text-center space-y-6">
                {/* Icon */}
                <div className="mx-auto w-16 h-16 rounded-full bg-unispa-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-unispa-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Check Your Email</h2>
                  <p className="mt-2 text-slate-500">
                    We've sent a verification link to
                  </p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{maskedEmail}</p>
                </div>

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600">
                    Click the verification link in the email to activate your account. The link will expire in 60 minutes.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={resendVerification}
                    disabled={processing}
                    className="w-full py-3 bg-unispa-primary hover:bg-unispa-primaryDark text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {processing ? 'Sending...' : 'Resend Verification Email'}
                  </button>

                  <Link
                    href={route('customer.login')}
                    className="block text-sm text-slate-400 hover:text-slate-600 transition"
                  >
                    ← Back to Sign In
                  </Link>
                </div>

                <p className="text-xs text-slate-400">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
