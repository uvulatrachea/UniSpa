<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class SignupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'unique:customer,email', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/', // At least one uppercase
                'regex:/[0-9]/', // At least one number
                'regex:/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', // At least one special char
            ],
            'password_confirmation' => ['required', 'string', 'same:password'],
            'otp' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email address is required',
            'email.email' => 'Please enter a valid email address',
            'email.unique' => 'This email is already registered',
            'name.required' => 'Full name is required',
            'name.string' => 'Full name must be text',
            'name.max' => 'Full name must not exceed 255 characters',
            'phone.required' => 'Phone number is required',
            'phone.max' => 'Phone number must not exceed 20 characters',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
            'password.regex' => 'Password must contain uppercase letters, numbers, and special characters',
            'password_confirmation.required' => 'Password confirmation is required',
            'password_confirmation.same' => 'Passwords do not match',
            'otp.required' => 'OTP is required',
            'otp.size' => 'OTP must be exactly 6 digits',
            'otp.regex' => 'OTP must contain only numbers',
        ];
    }
}
