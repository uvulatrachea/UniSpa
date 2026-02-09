import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function StaffLogin() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('staff.login.post'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout wide>
            <Head title="Staff Login" />

            <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-unispa-surfaceAlt to-white">
                <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex h-[600px]">

                        {/* LEFT PANEL */}
                        <div
                            className="w-2/5 p-10 text-white relative"
                            style={{
                                backgroundImage: 'url("/images/spa-login-bg.jpg")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-unispa-primary/20 to-unispa-primaryDark/80"></div>

                            <div className="relative z-10 h-full flex flex-col justify-center text-center">
                                <img
                                    src="/images/unispa-logo-gold.png"
                                    className="w-24 mx-auto mb-4"
                                />
                                <h1 className="text-4xl font-bold">UniSpa Staff</h1>
                                <p className="mt-4 opacity-90">
                                    Authorized staff access only
                                </p>
                            </div>
                        </div>

                        {/* RIGHT PANEL */}
                        <div className="w-3/5 p-12 flex flex-col justify-center">
                            <h2 className="text-3xl font-bold mb-2">Staff Login</h2>
                            <p className="text-unispa-subtle mb-8">
                                Sign in to manage UniSpa operations
                            </p>
            
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="email" value="Staff Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        autoComplete="username"
                                        error={errors.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="staff@unispa.com"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        error={errors.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-1" />
                                </div>

                                <div className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData('remember', e.target.checked)
                                        }
                                    />
                                    <span className="ml-2 text-sm">
                                        Remember me
                                    </span>
                                </div>

                                <PrimaryButton
                                    className="w-full py-3"
                                    disabled={processing}
                                >
                                    {processing ? 'Signing in...' : 'Sign In'}
                                </PrimaryButton>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
