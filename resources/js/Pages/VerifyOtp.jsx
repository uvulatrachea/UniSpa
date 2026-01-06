import { useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function VerifyOtp({ email }) {
    const { data, setData, post, processing, errors } = useForm({
        email: email,
        otp_code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('verify.otp'), {
            onSuccess: () => alert('OTP Verified! You can now log in.'),
        });
    };

    return (
        <div>
            <h2>Enter OTP sent to {email}</h2>
            <form onSubmit={submit}>
                <InputLabel value="OTP Code" />
                <TextInput
                    name="otp_code"
                    value={data.otp_code}
                    onChange={(e) => setData('otp_code', e.target.value)}
                    required
                />
                <InputError message={errors.otp_code} className="mt-2" />

                <PrimaryButton className="mt-4" disabled={processing}>
                    Verify
                </PrimaryButton>
            </form>
        </div>
    );
}
