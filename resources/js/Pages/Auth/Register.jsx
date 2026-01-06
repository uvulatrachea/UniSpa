import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    phone: '',
    cust_type: 'regular',
    member_type: 'student',
    password: '',
    password_confirmation: '',
    is_uitm_member: 0,
  });

  const [activeTab, setActiveTab] = useState('regular');
  const [memberType, setMemberType] = useState('student');
  const [emailError, setEmailError] = useState('');
  const [activeForm, setActiveForm] = useState('register');

  useEffect(() => {
    if (data.email && activeTab === 'uitm_member') {
      validateUITMEmail(data.email, memberType);
    } else {
      setEmailError('');
    }
  }, [data.email, memberType, activeTab]);

  const validateUITMEmail = (email, type) => {
    const emailLower = email.toLowerCase();
    if (type === 'student') {
      if (!emailLower.endsWith('@student.uitm.edu.my')) {
        setEmailError('UITM students must use @student.uitm.edu.my email');
        return false;
      }
    } else if (type === 'staff') {
      if (!emailLower.endsWith('@staff.uitm.edu.my')) {
        setEmailError('UITM staff must use @staff.uitm.edu.my email');
        return false;
      }
    }
    setEmailError('');
    return true;
  };

  const submit = (e) => {
    e.preventDefault();
    if (activeTab === 'uitm_member') {
      if (!validateUITMEmail(data.email, memberType)) {
        return;
      }
      setData('is_uitm_member', 1);
    } else {
      setData('is_uitm_member', 0);
    }
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  const handleTabClick = (type) => {
    setActiveTab(type);
    setData('cust_type', type);
    setEmailError('');
  };

  const handleMemberTypeChange = (type) => {
    setMemberType(type);
    setData('member_type', type);
    setEmailError('');
  };

  const getEmailPlaceholder = () => {
    if (activeTab === 'uitm_member') {
      if (memberType === 'staff') {
        return 'john.doe@staff.uitm.edu.my';
      } else {
        return '2020123456@student.uitm.edu.my';
      }
    }
    return 'example@gmail.com';
  };

  const handleFormSwitch = (form) => {
    if (form === 'login') {
      router.visit(route('login'));
    }
  };

  return (
    <GuestLayout wide>
      <Head title="Register" />
      
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
                    Your all-in-one platform for university services and wellness.
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
                      <h3 className="font-medium">Simple Setup</h3>
                      <p className="text-sm opacity-80">Easy registration process</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Secure Platform</h3>
                      <p className="text-sm opacity-80">Your data is always protected</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Community</h3>
                      <p className="text-sm opacity-80">Connect with students & staff</p>
                    </div>
                  </div>
                </div>

                {/* Switch to Login */}
                <div className="pt-6 border-t border-white/20">
                  <div className="text-sm mb-3">Already have an account?</div>
                  <button
                    onClick={() => handleFormSwitch('login')}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Form Panel with Scroll */}
            <div className="w-3/5 p-8">
              <div className="h-full flex flex-col">
                {/* Tabs */}
                <div className="flex space-x-6 mb-8">
                  <button
                    onClick={() => setActiveForm('register')}
                    className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                      activeForm === 'register'
                        ? 'bg-unispa-primary text-white'
                        : 'text-unispa-subtle hover:text-unispa-ink'
                    }`}
                  >
                    Register
                  </button>
                  <button
                    onClick={() => handleFormSwitch('login')}
                    className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                      activeForm === 'login'
                        ? 'bg-unispa-primary text-white'
                        : 'text-unispa-subtle hover:text-unispa-ink'
                    }`}
                  >
                    Login
                  </button>
                </div>

                {/* Form Title */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-unispa-ink">Create Account</h2>
                  <p className="text-unispa-subtle mt-1">Join thousands of students and staff</p>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto pr-2">
                  <form onSubmit={submit} className="space-y-6">
                    {/* User Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-unispa-ink mb-3">
                        Select User Type
                      </label>
                      <div className="flex rounded-lg overflow-hidden border border-unispa-muted">
                        <button
                          type="button"
                          onClick={() => handleTabClick('uitm_member')}
                          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                            activeTab === 'uitm_member'
                              ? 'bg-unispa-primary text-white'
                              : 'bg-white text-unispa-ink hover:bg-unispa-muted'
                          }`}
                        >
                          UITM Member
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTabClick('regular')}
                          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                            activeTab === 'regular'
                              ? 'bg-unispa-primary text-white'
                              : 'bg-white text-unispa-ink hover:bg-unispa-muted'
                          }`}
                        >
                          Regular User
                        </button>
                      </div>

                      {/* User Type Info */}
                      <div className="mt-4">
                        {activeTab === 'uitm_member' && (
                          <div className="p-4 bg-unispa-muted rounded-lg">
                            <p className="text-sm font-medium text-unispa-ink mb-3">UITM Member Type</p>
                            <div className="flex space-x-6">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="member_type"
                                  value="student"
                                  checked={memberType === 'student'}
                                  onChange={() => handleMemberTypeChange('student')}
                                  className="mr-2 text-unispa-primary"
                                />
                                <span className="text-sm">Student</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="member_type"
                                  value="staff"
                                  checked={memberType === 'staff'}
                                  onChange={() => handleMemberTypeChange('staff')}
                                  className="mr-2 text-unispa-primary"
                                />
                                <span className="text-sm">Staff</span>
                              </label>
                            </div>
                          </div>
                        )}
                        
                        {activeTab === 'regular' && (
                          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <p className="text-sm text-unispa-ink">
                              Non-UITM users can register with any valid email address.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div>
                      <InputLabel htmlFor="name" value="Username" className="text-sm font-medium text-unispa-ink mb-2" />
                      <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="w-full border border-gray-300 focus:border-unispa-primary focus:ring-unispa-primary rounded-lg py-3 px-4"
                        autoComplete="name"
                        isFocused
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        placeholder="Enter username"
                      />
                      <InputError message={errors.name} className="mt-1 text-xs" />
                    </div>

                    <div>
                      <InputLabel htmlFor="email" value="Email" className="text-sm font-medium text-unispa-ink mb-2" />
                      <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="w-full border border-gray-300 focus:border-unispa-primary focus:ring-unispa-primary rounded-lg py-3 px-4"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        placeholder={getEmailPlaceholder()}
                      />
                      {emailError && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700">{emailError}</p>
                        </div>
                      )}
                      <InputError message={errors.email} className="mt-1 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <InputLabel htmlFor="phone" value="Phone" className="text-sm font-medium text-unispa-ink mb-2" />
                        <TextInput
                          id="phone"
                          type="text"
                          name="phone"
                          value={data.phone}
                          className="w-full border border-gray-300 focus:border-unispa-primary focus:ring-unispa-primary rounded-lg py-3 px-4"
                          onChange={(e) => setData('phone', e.target.value)}
                          required
                          placeholder="Phone number"
                        />
                        <InputError message={errors.phone} className="mt-1 text-xs" />
                      </div>

                      <div>
                        <InputLabel htmlFor="password" value="Password" className="text-sm font-medium text-unispa-ink mb-2" />
                        <TextInput
                          id="password"
                          type="password"
                          name="password"
                          value={data.password}
                          className="w-full border border-gray-300 focus:border-unispa-primary focus:ring-unispa-primary rounded-lg py-3 px-4"
                          autoComplete="new-password"
                          onChange={(e) => setData('password', e.target.value)}
                          required
                          placeholder="••••••••"
                        />
                        <InputError message={errors.password} className="mt-1 text-xs" />
                      </div>
                    </div>

                    <div>
                      <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-sm font-medium text-unispa-ink mb-2" />
                      <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="w-full border border-gray-300 focus:border-unispa-primary focus:ring-unispa-primary rounded-lg py-3 px-4"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="pt-4">
                      <PrimaryButton 
                        className="w-full py-3 bg-unispa-primary hover:bg-unispa-primaryDark text-white rounded-lg font-medium transition-colors" 
                        disabled={processing || (activeTab === 'uitm_member' && emailError)}
                      >
                        {processing ? 'Creating Account...' : 'Create Account'}
                      </PrimaryButton>
                    </div>

                    <div className="text-center text-sm text-unispa-subtle pt-2">
                      <p>
                        Already have an account?{' '}
                        <Link href={route('login')} className="text-unispa-primary hover:underline">
                          Sign In
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