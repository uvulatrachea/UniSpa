import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import PasswordInput from '@/Components/Auth/PasswordInput';
import PasswordValidator from '@/Components/Auth/PasswordValidator';
import GoogleButton from '@/Components/Auth/GoogleButton';
import OtpInput from '@/Components/Auth/OtpInput';

export default function CustomerSignup() {
    const [activeTab, setActiveTab] = useState('email');
    const [step, setStep] = useState('info'); // 'info', 'otp' (UITM only), 'password'
    
    // Form data
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phone: '',
        password: '',
        password_confirmation: '',
        otp: '',
        customer_type: '', // 'uitm' or 'non-uitm'
        agree_terms: false,
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [requiresOtp, setRequiresOtp] = useState(null); // null, true, or false

    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const isUitmEmail = (email) => {
        return /@uitm\.edu\.my$/.test(email.toLowerCase());
    };

    const validatePhone = (value) => {
        return value.trim().length >= 10;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validate info step
        if (!formData.email.trim()) {
            setErrors({ email: 'Email is required' });
            return;
        }

        if (!validateEmail(formData.email)) {
            setErrors({ email: 'Please enter a valid email address' });
            return;
        }

        if (!formData.name.trim()) {
            setErrors({ name: 'Full name is required' });
            return;
        }

        if (!formData.phone.trim()) {
            setErrors({ phone: 'Phone number is required' });
            return;
        }

        if (!validatePhone(formData.phone)) {
            setErrors({ phone: 'Phone number must be at least 10 digits' });
            return;
        }

        if (!formData.customer_type) {
            setErrors({ customer_type: 'Please select your customer type' });
            return;
        }

        // Validate UITM email domain
        if (formData.customer_type === 'uitm' && !isUitmEmail(formData.email)) {
            setErrors({ email: 'For UITM members, please use your @uitm.edu.my email address' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/customer/signup/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ 
                    email: formData.email, 
                    name: formData.name,
                    phone: formData.phone,
                    customer_type: formData.customer_type,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // ALL users go straight to password step after sending OTP
                // OTP verification will happen AFTER account creation at /verify-otp
                setStep('password');
                setMessage('Now create a secure password for your account.');
            } else {
                setErrors({ email: data.message });
            }
        } catch (error) {
            console.error('Error:', error);
            setErrors({ email: 'Failed to process. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setErrors({});

        if (formData.otp.length !== 6) {
            setErrors({ otp: 'OTP must be 6 digits' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/customer/signup/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ email: formData.email, otp: formData.otp }),
            });

            const data = await response.json();

            if (data.success) {
                setStep('password');
                setMessage('Email verified! Now create a secure password.');
            } else {
                setErrors({ otp: data.message });
            }
        } catch (error) {
            console.error('Error:', error);
            setErrors({ otp: 'Verification failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        try {
            const response = await fetch('/customer/signup/resend-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ email: formData.email, name: formData.name }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage('New OTP has been sent to your email');
            } else {
                setErrors({ otp: data.message });
            }
        } catch (error) {
            console.error('Error:', error);
            setErrors({ otp: 'Failed to resend OTP. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteSignup = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validate password step
        if (!formData.password) {
            setErrors({ password: 'Password is required' });
            return;
        }

        if (formData.password.length < 8) {
            setErrors({ password: 'Password must be at least 8 characters' });
            return;
        }

        if (!/[A-Z]/.test(formData.password)) {
            setErrors({ password: 'Password must contain at least one uppercase letter' });
            return;
        }

        if (!/[0-9]/.test(formData.password)) {
            setErrors({ password: 'Password must contain at least one number' });
            return;
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
            setErrors({ password: 'Password must contain at least one special character' });
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setErrors({ password_confirmation: 'Passwords do not match' });
            return;
        }

        if (!formData.agree_terms) {
            setErrors({ agree_terms: 'You must agree to the terms' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/customer/signup/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to OTP verification page using backend redirect URL
                const redirectUrl = data.redirect || '/verify-otp?email=' + encodeURIComponent(formData.email);
                window.location.href = redirectUrl;
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ form: data.message });
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setErrors({ form: 'Signup failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToInfo = () => {
        setStep('info');
        setFormData(prev => ({ ...prev, otp: '' }));
        setErrors({});
        setMessage(null);
    };

    const handleBackToOtp = () => {
        setStep('otp');
        setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
        setErrors({});
        setMessage(null);
    };

    return (
        <GuestLayout>
            <Head title="Customer Sign Up" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            <span className="text-purple-600">UniSpa</span>
                        </h1>
                        <p className="text-gray-600">Spa Management System</p>
                    </div>

                    {/* Signup Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                            Create Your Account
                        </h2>

                        {/* Step Indicator - Dynamic based on customer type */}
                        <div className="mb-6 flex items-center justify-between text-sm">
                            <div className={`flex items-center ${step === 'info' ? 'text-purple-600' : 'text-green-600'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-2 ${
                                    step === 'info' ? 'bg-purple-600' : 'bg-green-600'
                                }`}>
                                    1
                                </div>
                                <span>Info</span>
                            </div>
                            
                            {requiresOtp && (
                                <>
                                    <div className={`flex-1 h-1 mx-2 ${step !== 'info' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                                    <div className={`flex items-center ${step === 'otp' ? 'text-purple-600' : step === 'password' ? 'text-green-600' : 'text-gray-400'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-2 ${
                                            step === 'password' ? 'bg-green-600' : step === 'otp' ? 'bg-purple-600' : 'bg-gray-300'
                                        }`}>
                                            2
                                        </div>
                                        <span>OTP</span>
                                    </div>
                                </>
                            )}
                            
                            <div className={`flex-1 h-1 mx-2 ${step === 'password' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                            <div className={`flex items-center ${step === 'password' ? 'text-purple-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-2 ${
                                    step === 'password' ? 'bg-purple-600' : 'bg-gray-300'
                                }`}>
                                    {requiresOtp ? '3' : '2'}
                                </div>
                                <span>Password</span>
                            </div>
                        </div>

                        {/* Tabs */}
                        {step === 'info' && (
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setActiveTab('email')}
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                        activeTab === 'email'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Email Signup
                                </button>
                                <button
                                    onClick={() => setActiveTab('google')}
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                        activeTab === 'google'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Google Signup
                                </button>
                            </div>
                        )}

                        {/* Email Signup - Info Step */}
                        {activeTab === 'email' && step === 'info' && (
                            <form onSubmit={handleSendOtp}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="John Doe"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                            errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        disabled={isLoading}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="your@email.com"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                            errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        disabled={isLoading}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="+60 10 1234 5678"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                            errors.phone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        disabled={isLoading}
                                    />
                                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                                </div>

                                {/* Customer Type Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Customer Type *
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors"
                                               style={{
                                                   borderColor: formData.customer_type === 'uitm' ? '#9333ea' : '#e5e7eb',
                                                   backgroundColor: formData.customer_type === 'uitm' ? '#faf5ff' : 'white',
                                               }}>
                                            <input
                                                type="radio"
                                                name="customer_type"
                                                value="uitm"
                                                checked={formData.customer_type === 'uitm'}
                                                onChange={(e) => handleInputChange('customer_type', e.target.value)}
                                                className="w-4 h-4 text-purple-600 cursor-pointer"
                                                disabled={isLoading}
                                            />
                                            <div className="ml-3">
                                                <p className="font-medium text-gray-900">UITM Member</p>
                                                <p className="text-xs text-gray-600">Student or Staff with @uitm.edu.my email</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors"
                                               style={{
                                                   borderColor: formData.customer_type === 'non-uitm' ? '#9333ea' : '#e5e7eb',
                                                   backgroundColor: formData.customer_type === 'non-uitm' ? '#faf5ff' : 'white',
                                               }}>
                                            <input
                                                type="radio"
                                                name="customer_type"
                                                value="non-uitm"
                                                checked={formData.customer_type === 'non-uitm'}
                                                onChange={(e) => handleInputChange('customer_type', e.target.value)}
                                                className="w-4 h-4 text-purple-600 cursor-pointer"
                                                disabled={isLoading}
                                            />
                                            <div className="ml-3">
                                                <p className="font-medium text-gray-900">Non-UITM Customer</p>
                                                <p className="text-xs text-gray-600">General public or external customers</p>
                                            </div>
                                        </label>
                                    </div>
                                    {errors.customer_type && <p className="mt-2 text-sm text-red-500">{errors.customer_type}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Checking...' : 'Continue'}
                                </button>
                            </form>
                        )}

                        {/* Email Signup - OTP Step */}
                        {activeTab === 'email' && step === 'otp' && (
                            <form onSubmit={handleVerifyOtp}>
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        OTP sent to <strong>{formData.email}</strong>
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <OtpInput
                                        value={formData.otp}
                                        onChange={(value) => handleInputChange('otp', value)}
                                        error={errors.otp}
                                        isLoading={isLoading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || formData.otp.length !== 6}
                                    className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBackToInfo}
                                    className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Back to Info
                                </button>
                            </form>
                        )}

                        {/* Email Signup - Password Step */}
                        {activeTab === 'email' && step === 'password' && (
                            <form onSubmit={handleCompleteSignup}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <PasswordInput
                                        value={formData.password}
                                        onChange={(value) => handleInputChange('password', value)}
                                        placeholder="Create a strong password"
                                        name="password"
                                        error={errors.password}
                                    />
                                </div>

                                <PasswordValidator
                                    password={formData.password}
                                    passwordMatch={formData.password === formData.password_confirmation && formData.password}
                                />

                                <div className="mb-6 mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <PasswordInput
                                        value={formData.password_confirmation}
                                        onChange={(value) => handleInputChange('password_confirmation', value)}
                                        placeholder="Confirm your password"
                                        name="password_confirmation"
                                        error={errors.password_confirmation}
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.agree_terms}
                                            onChange={(e) => handleInputChange('agree_terms', e.target.checked)}
                                            className="w-4 h-4 text-purple-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700">
                                            I agree to the{' '}
                                            <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                                                Terms & Conditions
                                            </a>
                                        </span>
                                    </label>
                                    {errors.agree_terms && (
                                        <p className="mt-1 text-sm text-red-500">{errors.agree_terms}</p>
                                    )}
                                </div>

                                {errors.form && (
                                    <div className="mb-4 p-3 bg-red-50 rounded-lg">
                                        <p className="text-sm text-red-800">{errors.form}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBackToOtp}
                                    className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Back to OTP
                                </button>
                            </form>
                        )}

                        {/* Google Signup Tab */}
                        {activeTab === 'google' && step === 'info' && (
                            <div className="space-y-4">
                                <GoogleButton type="signup" />
                                <p className="text-sm text-gray-600 text-center">
                                    Sign up with your Google account. You'll set up your password after.
                                </p>
                            </div>
                        )}

                        {/* Divider */}
                        {step === 'info' && (
                            <>
                                <div className="my-6 relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">or</span>
                                    </div>
                                </div>

                                {/* Sign In Link */}
                                <p className="text-center text-gray-600">
                                    Already have an account?{' '}
                                    <Link href="/customer/login" className="text-purple-600 hover:text-purple-700 font-medium">
                                        Sign In
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-gray-600 text-sm mt-6">
                        For staff and admin signup, please use different access
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
