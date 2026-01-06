import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [activeForm, setActiveForm] = useState('login');

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleFormSwitch = (form) => {
        if (form === 'register') {
            router.visit(route('register'));
        }
    };

    return (
        <GuestLayout wide>
            <Head title="Log in" />
            
            <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-unispa-surfaceAlt to-white">
                <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="flex h-[600px]">
                        {/* Left Side - Info Panel */}
                        <div className="w-2/5 bg-gradient-to-br from-unispa-primary to-unispa-primaryDark p-8 text-white">
                            <div className="h-full flex flex-col">
                                {/* Logo */}
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
                                        Welcome back to your university wellness space.
                                    </p>
                                </div>

                                {/* Benefits */}
                                <div className="space-y-5 flex-1">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Quick Access</h3>
                                            <p className="text-sm opacity-80">Return to your dashboard</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Secure Return</h3>
                                            <p className="text-sm opacity-80">Your data is protected</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Stay Connected</h3>
                                            <p className="text-sm opacity-80">Rejoin the community</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Switch to Register */}
                                <div className="pt-6 border-t border-white/20">
                                    <div className="text-sm mb-3">New to UniSpa?</div>
                                    <button
                                        onClick={() => handleFormSwitch('register')}
                                        className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        Create Account
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form Panel */}
                        <div className="w-3/5 p-8">
                            <div className="h-full flex flex-col">
                                {/* Tabs */}
                                <div className="flex space-x-6 mb-8">
                                    <button
                                        onClick={() => setActiveForm('login')}
                                        className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                                            activeForm === 'login'
                                                ? 'bg-unispa-primary text-white'
                                                : 'text-unispa-subtle hover:text-unispa-ink'
                                        }`}
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => handleFormSwitch('register')}
                                        className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                                            activeForm === 'register'
                                                ? 'bg-unispa-primary text-white'
                                                : 'text-unispa-subtle hover:text-unispa-ink'
                                        }`}
                                    >
                                        Register
                                    </button>
                                </div>

                                {/* Form Title */}
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-unispa-ink">Welcome Back</h2>
                                    <p className="text-unispa-subtle mt-1">Sign in to continue your wellness journey</p>
                                </div>

                                {status && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-800">{status}</p>
                                    </div>
                                )}

                                {/* Form */}
                                <div className="space-y-6">
                                    <form onSubmit={submit}>
                                        <div>
                                            <InputLabel htmlFor="email" value="Email" className="text-sm font-medium text-unispa-ink mb-2" />
                                            <TextInput
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className="w-full border border-gray-300 focus:border-unispa-primary focus:ring-unispa-primary rounded-lg py-3 px-4"
                                                autoComplete="username"
                                                isFocused={true}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="your.email@example.com"
                                            />
                                            <InputError message={errors.email} className="mt-1 text-xs" />
                                        </div>

                                        <div className="mt-6">
                                            <InputLabel htmlFor="password" value="Password" className="text-sm font-medium text-unispa-ink mb-2" />
                                            <TextInput
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={data.password}
                                                className="w-full border border-gray-300 focus:border-unispa-primary focus:ring-unispa-primary rounded-lg py-3 px-4"
                                                autoComplete="current-password"
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="••••••••"
                                            />
                                            <InputError message={errors.password} className="mt-1 text-xs" />
                                        </div>

                                        <div className="flex items-center justify-between mt-6">
                                            <label className="flex items-center">
                                                <Checkbox
                                                    name="remember"
                                                    checked={data.remember}
                                                    onChange={(e) =>
                                                        setData('remember', e.target.checked)
                                                    }
                                                    className="border-gray-300 text-unispa-primary focus:ring-unispa-primary"
                                                />
                                                <span className="ms-2 text-sm text-unispa-ink">
                                                    Remember me
                                                </span>
                                            </label>
                                            
                                            {canResetPassword && (
                                                <Link
                                                    href={route('password.request')}
                                                    className="text-sm text-unispa-primary hover:underline"
                                                >
                                                    Forgot password?
                                                </Link>
                                            )}
                                        </div>

                                        <div className="mt-8">
                                            <PrimaryButton 
                                                className="w-full py-3 bg-unispa-primary hover:bg-unispa-primaryDark text-white rounded-lg font-medium transition-colors" 
                                                disabled={processing}
                                            >
                                                {processing ? 'Signing in...' : 'Sign In'}
                                            </PrimaryButton>
                                        </div>

                                        <div className="text-center text-sm text-unispa-subtle mt-6">
                                            <p>
                                                Don't have an account?{' '}
                                                <Link href={route('register')} className="text-unispa-primary hover:underline">
                                                    Create Account
                                                </Link>
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}