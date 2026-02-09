import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function Auth() {
  const { defaultPanel = 'login', status, canResetPassword = true } = usePage().props;

  const loginForm = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const registerForm = useForm({
    name: '',
    email: '',
    phone: '',
    cust_type: 'regular',          // ✅ 'regular' | 'uitm_member'
    member_type: '',              // ✅ 'student' | 'staff' | ''
    password: '',
    password_confirmation: '',
    is_uitm_member: 0,            // ✅ 0/1 (casts to boolean in model)
  });

  const [panel, setPanel] = useState(defaultPanel);
  const [activeTab, setActiveTab] = useState('regular'); // regular | uitm_member
  const [memberType, setMemberType] = useState('');
  const [emailError, setEmailError] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => setPanel(defaultPanel), [defaultPanel]);

  // Keep URL in sync when switching panel from the LEFT CTA button.
  useEffect(() => {
    // Avoid infinite navigation loops: only navigate when URL doesn't match panel.
    const desired = panel === 'login' ? route('customer.login') : route('customer.signup');
    const current = window.location.pathname;
    const desiredPath = new URL(desired, window.location.origin).pathname;
    if (current !== desiredPath) {
      router.visit(desired, { preserveScroll: true, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel]);

  useEffect(() => {
    const isUitm = activeTab === 'uitm_member' ? 1 : 0;
    registerForm.setData('is_uitm_member', isUitm);
    registerForm.setData('cust_type', activeTab);
    registerForm.setData('member_type', activeTab === 'uitm_member' ? (memberType || '') : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, memberType]);

  useEffect(() => {
    if (activeTab !== 'uitm_member') {
      setEmailError('');
      return;
    }
    if (!registerForm.data.email) {
      setEmailError('');
      return;
    }
    validateUITMEmail(registerForm.data.email, memberType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerForm.data.email, memberType, activeTab]);

  const validateUITMEmail = (email, type) => {
    const e = String(email).toLowerCase().trim();

    if (!type) {
      setEmailError('Please select member type first');
      return false;
    }
    if (type === 'student' && !e.endsWith('@student.uitm.edu.my')) {
      setEmailError('UITM students must use @student.uitm.edu.my email');
      return false;
    }
    if (type === 'staff' && !e.endsWith('@staff.uitm.edu.my')) {
      setEmailError('UITM staff must use @staff.uitm.edu.my email');
      return false;
    }

    setEmailError('');
    return true;
  };

  const noticeClass = useMemo(() => {
    if (!notice) return '';
    if (notice.type === 'success') return 'bg-green-50 border-green-200 text-green-700';
    if (notice.type === 'error') return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-blue-50 border-blue-200 text-blue-700';
  }, [notice]);

  const submitLogin = (e) => {
    e.preventDefault();
    setNotice(null);

    loginForm.post(route('customer.login.post'), {
      preserveScroll: true,
      onStart: () => setNotice({ type: 'info', text: 'Signing in…' }),
      onFinish: () => loginForm.reset('password'),
      onError: () => setNotice({ type: 'error', text: 'Login failed. Please check your details.' }),
    });
  };

  const submitRegister = (e) => {
    e.preventDefault();
    setNotice(null);

    if (activeTab === 'uitm_member' && !memberType) {
      setEmailError('Please select member type (student or staff)');
      setNotice({ type: 'error', text: 'Please select UITM member type.' });
      return;
    }

    if (activeTab === 'uitm_member') {
      if (!validateUITMEmail(registerForm.data.email, memberType)) {
        setNotice({ type: 'error', text: 'Please fix your UITM email format.' });
        return;
      }
      registerForm.setData('member_type', memberType);
      registerForm.setData('is_uitm_member', 1);
    } else {
      registerForm.setData('member_type', '');
      registerForm.setData('is_uitm_member', 0);
      setMemberType('');
      setEmailError('');
    }

    registerForm.post(route('customer.register'), {
      preserveScroll: true,
      onStart: () => setNotice({ type: 'info', text: 'Creating your account…' }),
      onFinish: () => registerForm.reset('password', 'password_confirmation'),
      onSuccess: () => {
        setNotice({ type: 'success', text: 'Account created! Please login.' });
        // Navigate to login page so the URL matches the panel.
        router.visit(route('customer.login'), { preserveScroll: true });
      },
      onError: (errs) => {
        if (errs.email) setEmailError(errs.email);
        setNotice({ type: 'error', text: 'Registration failed. Please check the form.' });
      },
    });
  };

  return (
    <GuestLayout wide>
      <Head title={panel === 'login' ? 'Customer Login' : 'Customer Register'} />

      {/* ✅ IMPORTANT: allow PAGE scroll always */}
      <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-br from-unispa-surfaceAlt to-white">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* ✅ Responsive layout: stack on mobile, split on md+ */}
            <div className="flex flex-col md:flex-row">

              {/* LEFT */}
              <div
                className="md:w-2/5 p-8 md:p-10 text-white relative overflow-hidden"
                style={{
                  backgroundImage: 'url("/images/spa-login-bg.jpg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-unispa-primary/10 to-unispa-primaryDark/75"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>

                <div className="relative z-10 flex flex-col h-full min-h-[260px] md:min-h-[560px]">
                  <div className="mb-10">
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2 shadow-lg border border-white/30">
                        <img src="/images/unispa-logo-gold.png" alt="UniSpa Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                      </div>
                      <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">UniSpa</h1>
                        <div className="inline-flex items-center px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                          <span className="text-xs md:text-sm font-semibold tracking-wide">UiTM's 1st MASMED Spa Platform</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm md:text-base opacity-95 mt-4 text-center px-4 leading-relaxed">
                      {panel === 'login'
                        ? 'Sign in to continue your wellness journey.'
                        : 'Create your UniSpa account in a few steps.'}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/30 mt-auto">
                    <div className="text-sm mb-4 text-center opacity-95">
                      {panel === 'login' ? 'New to UniSpa?' : 'Already have an account?'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPanel(panel === 'login' ? 'register' : 'login')}
                      className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all font-medium border border-white/30"
                    >
                      {panel === 'login' ? 'Create New Account' : 'Sign In to Your Account'}
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="md:w-3/5 p-6 sm:p-8 md:p-10">
                {/* Tabs (with sliding highlight) */}
                <div className="relative mb-6 p-1 bg-gray-100 rounded-xl w-fit">
                  <div className="relative flex">
                    {/* Sliding highlight */}
                    <div
                      className={`absolute top-1 bottom-1 w-1/2 bg-white shadow rounded-lg transition-transform duration-300 ease-out ${
                        panel === 'login' ? 'translate-x-full' : 'translate-x-0'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setPanel('register');
                        router.visit(route('customer.signup'), { preserveScroll: true });
                      }}
                      className={`relative z-10 px-6 py-3 font-semibold rounded-lg transition ${panel === 'register' ? 'text-unispa-primary' : 'text-gray-500'}`}
                    >
                      Register
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPanel('login');
                        router.visit(route('customer.login'), { preserveScroll: true });
                      }}
                      className={`relative z-10 px-6 py-3 font-semibold rounded-lg transition ${panel === 'login' ? 'text-unispa-primary' : 'text-gray-500'}`}
                    >
                      Login
                    </button>
                  </div>
                </div>

                {status && (
                  <div className="mb-4 p-4 rounded-xl border bg-green-50 border-green-200 text-green-700 text-sm">
                    {status}
                  </div>
                )}

                {notice && (
                  <div className={`mb-4 p-4 rounded-xl border text-sm ${noticeClass}`}>
                    {notice.text}
                  </div>
                )}

                {/* ✅ RIGHT SIDE MUST SCROLL IF LONG */}
                <div className="max-h-[70vh] md:max-h-[560px] overflow-y-auto pr-2">
                  {/* REGISTER */}
                  {panel === 'register' && (
                    <div>
                      <h2 className="text-3xl font-bold text-unispa-ink mb-2">Create Account</h2>
                      <p className="text-gray-500 mb-6">Join thousands of students and staff</p>

                      <form onSubmit={submitRegister} className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-unispa-ink mb-3">Select User Type</label>
                          <div className="flex rounded-xl overflow-hidden border border-gray-200">
                            <button
                              type="button"
                              onClick={() => setActiveTab('uitm_member')}
                              className={`flex-1 py-3 font-semibold ${activeTab === 'uitm_member' ? 'bg-unispa-primary text-white' : 'bg-white text-gray-700'}`}
                            >
                              UiTM Member
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab('regular')}
                              className={`flex-1 py-3 font-semibold ${activeTab === 'regular' ? 'bg-unispa-primary text-white' : 'bg-white text-gray-700'}`}
                            >
                              Regular User
                            </button>
                          </div>

                          {activeTab === 'uitm_member' && (
                            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                              <p className="text-sm font-semibold mb-3">UiTM Member Type</p>
                              <div className="flex gap-8">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="member_type"
                                    checked={memberType === 'student'}
                                    onChange={() => setMemberType('student')}
                                    className="mr-2"
                                  />
                                  Student
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="member_type"
                                    checked={memberType === 'staff'}
                                    onChange={() => setMemberType('staff')}
                                    className="mr-2"
                                  />
                                  Staff
                                </label>
                              </div>
                            </div>
                          )}

                          {activeTab === 'regular' && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                              <p className="text-sm text-gray-700 font-medium">
                                Non-UiTM users can register with any valid email address.
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <InputLabel htmlFor="reg_name" value="Username" />
                          <TextInput
                            id="reg_name"
                            value={registerForm.data.name}
                            className="mt-1 block w-full"
                            onChange={(e) => registerForm.setData('name', e.target.value)}
                            required
                          />
                          <InputError message={registerForm.errors.name} className="mt-1" />
                        </div>

                        <div>
                          <InputLabel htmlFor="reg_email" value="Email" />
                          <TextInput
                            id="reg_email"
                            type="email"
                            value={registerForm.data.email}
                            className="mt-1 block w-full"
                            onChange={(e) => registerForm.setData('email', e.target.value)}
                            placeholder={
                              activeTab === 'uitm_member'
                                ? memberType === 'staff'
                                  ? 'john.doe@staff.uitm.edu.my'
                                  : memberType === 'student'
                                  ? '2020123456@student.uitm.edu.my'
                                  : 'Select member type first'
                                : 'example@gmail.com'
                            }
                            required
                          />

                          {emailError && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                              <p className="text-sm text-red-700 font-medium">{emailError}</p>
                            </div>
                          )}
                          <InputError message={registerForm.errors.email} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <InputLabel htmlFor="reg_phone" value="Phone" />
                            <TextInput
                              id="reg_phone"
                              value={registerForm.data.phone}
                              className="mt-1 block w-full"
                              onChange={(e) => registerForm.setData('phone', e.target.value)}
                              required
                            />
                            <InputError message={registerForm.errors.phone} className="mt-1" />
                          </div>
                          <div>
                            <InputLabel htmlFor="reg_password" value="Password" />
                            <TextInput
                              id="reg_password"
                              type="password"
                              value={registerForm.data.password}
                              className="mt-1 block w-full"
                              onChange={(e) => registerForm.setData('password', e.target.value)}
                              required
                            />
                            <InputError message={registerForm.errors.password} className="mt-1" />
                          </div>
                        </div>

                        <div>
                          <InputLabel htmlFor="reg_password_confirmation" value="Confirm Password" />
                          <TextInput
                            id="reg_password_confirmation"
                            type="password"
                            value={registerForm.data.password_confirmation}
                            className="mt-1 block w-full"
                            onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                            required
                          />
                          <InputError message={registerForm.errors.password_confirmation} className="mt-1" />
                        </div>

                        <PrimaryButton className="w-full" disabled={registerForm.processing || (activeTab === 'uitm_member' && !!emailError)}>
                          {registerForm.processing ? 'Creating Account...' : 'Create Account'}
                        </PrimaryButton>
                      </form>
                    </div>
                  )}

                  {/* LOGIN */}
                  {panel === 'login' && (
                    <div>
                      <h2 className="text-3xl font-bold text-unispa-ink mb-2">Welcome Back</h2>
                      <p className="text-gray-500 mb-6">Enter your email and password to continue</p>

                      {(loginForm.errors.email || loginForm.errors.password) && (
                        <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                          <p className="font-semibold mb-1">Login failed</p>
                          {loginForm.errors.email && <p>- {loginForm.errors.email}</p>}
                          {loginForm.errors.password && <p>- {loginForm.errors.password}</p>}
                        </div>
                      )}

                      <form onSubmit={submitLogin} className="space-y-5">
                        <div>
                          <InputLabel htmlFor="login_email" value="Email" />
                          <TextInput
                            id="login_email"
                            type="email"
                            value={loginForm.data.email}
                            className="mt-1 block w-full"
                            onChange={(e) => loginForm.setData('email', e.target.value)}
                            required
                          />
                          <InputError message={loginForm.errors.email} className="mt-1" />
                        </div>

                        <div>
                          <InputLabel htmlFor="login_password" value="Password" />
                          <TextInput
                            id="login_password"
                            type="password"
                            value={loginForm.data.password}
                            className="mt-1 block w-full"
                            onChange={(e) => loginForm.setData('password', e.target.value)}
                            required
                          />
                          <InputError message={loginForm.errors.password} className="mt-1" />
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center">
                            <Checkbox checked={loginForm.data.remember} onChange={(e) => loginForm.setData('remember', e.target.checked)} />
                            <span className="ml-2 text-sm">Remember me</span>
                          </label>

                          {canResetPassword && (
                            <Link href={route('password.request')} className="text-sm text-unispa-primary hover:underline">
                              Forgot password?
                            </Link>
                          )}
                        </div>

                        <PrimaryButton className="w-full" disabled={loginForm.processing}>
                          {loginForm.processing ? 'Signing in...' : 'Sign In'}
                        </PrimaryButton>
                      </form>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Tip: open <span className="font-semibold">/customer/login</span> or <span className="font-semibold">/customer/signup</span>.
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
