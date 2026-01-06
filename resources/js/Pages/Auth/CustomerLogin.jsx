import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import PasswordInput from '@/Components/Auth/PasswordInput';
import GoogleButton from '@/Components/Auth/GoogleButton';
import OtpInput from '@/Components/Auth/OtpInput';

export default function CustomerLogin() {
    const [activeTab, setActiveTab] = useState('email');
    const [step, setStep] = useState('email'); // 'email' or 'otp'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!email.trim()) {
            setErrors({ email: 'Email is required' });
            return;
        }

        if (!validateEmail(email)) {
            setErrors({ email: 'Please enter a valid email address' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/customer/auth/login-send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setStep('otp');
                setMessage('OTP sent successfully. Check your email.');
            } else {
                setErrors({ email: data.message });
            }
        } catch (error) {
            console.error('Error:', error);
            setErrors({ email: 'Failed to send OTP. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setErrors({});

        if (otp.length !== 6) {
            setErrors({ otp: 'OTP must be 6 digits' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/customer/auth/verify-otp-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = '/dashboard';
            } else {
                if (response.status === 429) {
                    setErrors({ otp: 'Too many attempts. Request a new OTP.' });
                    setStep('email');
                } else {
                    setErrors({ otp: data.message });
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setErrors({ otp: 'Verification failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToEmail = () => {
        setStep('email');
        setOtp('');
        setErrors({});
        setMessage(null);
    };

    return (
        <GuestLayout>
            <Head title="Customer Login" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            <span className="text-purple-600">UniSpa</span>
                        </h1>
                        <p className="text-gray-600">Spa Management System</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                            Sign In to Your Account
                        </h2>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => {
                                    setActiveTab('email');
                                    setStep('email');
                                    setEmail('');
                                    setOtp('');
                                    setErrors({});
                                    setMessage(null);
                                }}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                    activeTab === 'email'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Email Login
                            </button>
                            <button
                                onClick={() => setActiveTab('google')}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                    activeTab === 'google'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Google Login
                            </button>
                        </div>

                        {/* Email Login Tab */}
                        {activeTab === 'email' && (
                            <form onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp}>
                                {step === 'email' ? (
                                    <>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (errors.email) setErrors({});
                                                }}
                                                placeholder="your@email.com"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                disabled={isLoading}
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Sending...' : 'Send OTP'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                OTP has been sent to <strong>{email}</strong>
                                            </p>
                                        </div>

                                        <div className="mb-6">
                                            <OtpInput
                                                value={otp}
                                                onChange={setOtp}
                                                error={errors.otp}
                                                isLoading={isLoading}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading || otp.length !== 6}
                                            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
                                        >
                                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleBackToEmail}
                                            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Back to Email
                                        </button>
                                    </>
                                )}
                            </form>
                        )}

                        {/* Google Login Tab */}
                        {activeTab === 'google' && (
                            <div className="space-y-4">
                                <GoogleButton type="login" />
                                <p className="text-sm text-gray-600 text-center">
                                    Sign in with your Google account
                                </p>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="my-6 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">or</span>
                            </div>
                        </div>

                        {/* Sign Up Link */}
                        <p className="text-center text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/customer/signup" className="text-purple-600 hover:text-purple-700 font-medium">
                                Sign Up
                            </Link>
                        </p>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-gray-600 text-sm mt-6">
                        For staff and admin login, please use different access
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
