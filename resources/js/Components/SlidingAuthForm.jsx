import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function SlidingAuthForm({ 
    type = 'login', // 'login' or 'register'
    onSubmit,
    processing = false,
    errors = {},
    data = {},
    setData = () => {},
    canResetPassword = false,
    status
}) {
    const [rightPanelActive, setRightPanelActive] = useState(type === 'register');

    const handleSignUpClick = () => {
        setRightPanelActive(true);
    };

    const handleSignInClick = () => {
        setRightPanelActive(false);
    };

    // Default form data
    const formData = data || {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        remember: false
    };

    return (
        <div className={`auth-sliding-container ${rightPanelActive ? 'right-panel-active' : ''}`}>
            {/* Sign Up Form */}
            <div className="sliding-form-container sliding-signup-container">
                <form onSubmit={onSubmit} className="sliding-auth-form">
                    <h1 className="sliding-auth-title">Create Account</h1>
                    <p className="sliding-auth-subtitle">Join thousands of students and staff</p>
                    
                    {type === 'register' ? (
                        <>
                            <input 
                                type="text" 
                                className="sliding-auth-input"
                                placeholder="Name"
                                value={formData.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                            
                            <input 
                                type="email" 
                                className="sliding-auth-input"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                            
                            <input 
                                type="password" 
                                className="sliding-auth-input"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                            
                            <input 
                                type="password" 
                                className="sliding-auth-input"
                                placeholder="Confirm Password"
                                value={formData.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            
                            <button 
                                type="submit" 
                                className="sliding-auth-button glossy-btn"
                                disabled={processing}
                            >
                                {processing ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-6">
                                Full registration form available on the Register page
                            </p>
                            <Link 
                                href={route('register')}
                                className="sliding-auth-button glossy-btn inline-block"
                            >
                                Go to Register
                            </Link>
                        </div>
                    )}
                </form>
            </div>

            {/* Sign In Form */}
            <div className="sliding-form-container sliding-signin-container">
                <form onSubmit={type === 'login' ? onSubmit : (e) => { e.preventDefault(); handleSignInClick(); }} className="sliding-auth-form">
                    <h1 className="sliding-auth-title">Welcome Back</h1>
                    <p className="sliding-auth-subtitle">Sign in to continue your wellness journey</p>
                    
                    {type === 'login' ? (
                        <>
                            {status && (
                                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                                    {status}
                                </div>
                            )}
                            
                            <input 
                                type="email" 
                                className="sliding-auth-input"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                            
                            <input 
                                type="password" 
                                className="sliding-auth-input"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                            
                            <div className="flex items-center justify-between w-full mt-4">
                                <label className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        className="mr-2"
                                        checked={formData.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                                
                                {canResetPassword && (
                                    <Link 
                                        href={route('password.request')}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            
                            <button 
                                type="submit" 
                                className="sliding-auth-button glossy-btn"
                                disabled={processing}
                            >
                                {processing ? 'Signing in...' : 'Sign In'}
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-6">
                                Already have an account? Sign in below
                            </p>
                            <button 
                                type="button"
                                onClick={handleSignInClick}
                                className="sliding-auth-button glossy-btn"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Overlay Container (Purple Panel) */}
            <div className="sliding-overlay-container">
                <div className="sliding-overlay">
                    {/* Left Overlay Panel */}
                    <div className="sliding-overlay-panel sliding-overlay-left">
                        <h1 className="sliding-auth-title text-white">Welcome Back!</h1>
                        <p className="sliding-auth-paragraph">
                            To keep connected with us please login with your personal info
                        </p>
                        <button 
                            className="sliding-ghost-button sliding-auth-button glossy-btn" 
                            onClick={handleSignInClick}
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Right Overlay Panel */}
                    <div className="sliding-overlay-panel sliding-overlay-right">
                        <h1 className="sliding-auth-title text-white">Hello, Friend!</h1>
                        <p className="sliding-auth-paragraph">
                            Enter your personal details and start journey with us
                        </p>
                        <button 
                            className="sliding-ghost-button sliding-auth-button glossy-btn" 
                            onClick={handleSignUpClick}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}