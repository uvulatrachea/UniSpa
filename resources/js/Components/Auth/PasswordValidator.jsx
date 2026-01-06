import React from 'react';

export default function PasswordValidator({ password = '', passwordMatch = false }) {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        match: passwordMatch
    };

    const allValid = Object.values(checks).every(check => check);

    const requirements = [
        { key: 'length', label: 'At least 8 characters', check: checks.length },
        { key: 'uppercase', label: 'At least 1 uppercase letter (A-Z)', check: checks.uppercase },
        { key: 'number', label: 'At least 1 number (0-9)', check: checks.number },
        { key: 'special', label: 'At least 1 special character (!@#$%^&*)', check: checks.special },
        { key: 'match', label: 'Passwords match', check: checks.match }
    ];

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Password Requirements:</h4>
            
            <div className="space-y-2">
                {requirements.map(({ key, label, check }) => (
                    <div key={key} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            check ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                            {check ? '✓' : '○'}
                        </div>
                        <span className={`text-sm ${check ? 'text-green-700' : 'text-gray-600'}`}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${allValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-semibold ${allValid ? 'text-green-700' : 'text-red-700'}`}>
                        {allValid ? 'Password is strong' : 'Password is weak'}
                    </span>
                </div>
            </div>
        </div>
    );
}
