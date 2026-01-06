import React from 'react';

export default function OtpInput({ value, onChange, error = null, isLoading = false }) {
    const handleChange = (e) => {
        const input = e.target.value.replace(/\D/g, '').slice(0, 6);
        onChange(input);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit OTP
            </label>
            <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={value[index] || ''}
                        onChange={(e) => {
                            const newValue = value.split('');
                            newValue[index] = e.target.value.replace(/\D/g, '');
                            onChange(newValue.join(''));
                        }}
                        disabled={isLoading}
                        className={`w-12 h-12 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none transition-colors ${
                            error
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:border-purple-500'
                        } ${isLoading ? 'bg-gray-100' : 'bg-white'}`}
                    />
                ))}
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <p className="mt-2 text-xs text-gray-500">
                {value.length < 6 ? `Enter ${6 - value.length} more digit(s)` : 'Ready to verify'}
            </p>
        </div>
    );
}
