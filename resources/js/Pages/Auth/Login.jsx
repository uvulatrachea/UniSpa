import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword = true }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();

    post(route('customer.login.post'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <GuestLayout wide>
      <Head title="Customer Login" />

      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-unispa-surfaceAlt to-white">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex h-[600px]">
            {/* Left Side */}
            <div className="w-2/5 bg-gradient-to-br from-unispa-primary to-unispa-primaryDark p-8 text-white">
              <div className="h-full flex flex-col">
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

                <div className="space-y-5 flex-1">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                      <span className="text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Quick Access</h3>
                      <p className="text-sm opacity-80">Return to your dashboard</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                      <span className="text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Secure Return</h3>
                      <p className="text-sm opacity-80">Your data is protected</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/20">
                  <div className="text-sm mb-3">New to UniSpa?</div>
                  <Link
                    href={route('customer.signup')}
                    className="block text-center w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="w-3/5 p-8">
              <div className="h-full flex flex-col">
                <div className="flex space-x-6 mb-8">
                  <span className="px-4 py-2 font-medium rounded-lg bg-unispa-primary text-white">
                    Login
                  </span>
                  <Link
                    href={route('customer.signup')}
                    className="px-4 py-2 font-medium rounded-lg text-unispa-subtle hover:text-unispa-ink"
                  >
                    Register
                  </Link>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-unispa-ink">Welcome Back</h2>
                  <p className="text-unispa-subtle mt-1">Sign in to continue</p>
                </div>

                {status && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">{status}</p>
                  </div>
                )}

                <form onSubmit={submit} className="space-y-6">
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

                  <div>
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

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="border-gray-300 text-unispa-primary focus:ring-unispa-primary"
                      />
                      <span className="ms-2 text-sm text-unispa-ink">Remember me</span>
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

                  <PrimaryButton
                    className="w-full py-3 bg-unispa-primary hover:bg-unispa-primaryDark text-white rounded-lg font-medium transition-colors"
                    disabled={processing}
                  >
                    {processing ? 'Signing in...' : 'Sign In'}
                  </PrimaryButton>

                  <div className="text-center text-sm text-unispa-subtle">
                    Don’t have an account?{' '}
                    <Link href={route('customer.signup')} className="text-unispa-primary hover:underline">
                      Create Account
                    </Link>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
