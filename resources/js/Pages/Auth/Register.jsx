import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register() {
  const { data, setData, post, processing, errors } = useForm({
    name: '', email: '', phone: '', cust_type: 'regular', member_type: 'student',
    password: '', password_confirmation: '', is_uitm_member: 0,
  });

  const [activeTab, setActiveTab] = useState('regular');
  const [memberType, setMemberType] = useState('student');
  const [emailError, setEmailError] = useState('');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setEmailError(''); // Clear any existing email error when switching tabs
  };

  const handleMemberTypeChange = (type) => {
    setMemberType(type);
    setEmailError(''); // Clear any existing email error when switching member type
    // Re-validate email if it's already filled
    if (data.email) {
      validateUITMEmail(data.email, type);
    }
  };

  const validateUITMEmail = (email, type) => {
    const emailLower = (email || '').toLowerCase();
    if (type === 'student' && !emailLower.endsWith('@student.uitm.edu.my')) {
      setEmailError('UITM students must use @student.uitm.edu.my email');
      return false;
    } else if (type === 'staff' && !emailLower.endsWith('@staff.uitm.edu.my')) {
      setEmailError('UITM staff must use @staff.uitm.edu.my email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const submitRegistration = (e) => {
    e.preventDefault();
    if (activeTab === 'uitm_member') {
      if (!validateUITMEmail(data.email, memberType)) return;
      setData('is_uitm_member', 1);
      setData('cust_type', 'uitm_member');
      setData('member_type', memberType);
    } else {
      setData('is_uitm_member', 0);
      setData('cust_type', 'regular');
    }
    // Redirects to /verification/notice?email=xxx
    post(route('customer.register'));
  };

  return (
    <GuestLayout wide>
      <Head title="Register" />
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-unispa-surfaceAlt to-white">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex h-[600px]">
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
                  <p className="text-sm opacity-90 mt-4">Your all-in-one platform for university services.</p>
                </div>
                <div className="space-y-5 flex-1">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0"><span className="text-xs font-bold">1</span></div>
                    <div><h3 className="font-medium">Simple Setup</h3><p className="text-sm opacity-80">Easy registration</p></div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0"><span className="text-xs font-bold">2</span></div>
                    <div><h3 className="font-medium">Secure</h3><p className="text-sm opacity-80">Data protected</p></div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0"><span className="text-xs font-bold">3</span></div>
                    <div><h3 className="font-medium">Start Booking</h3><p className="text-sm opacity-80">Explore services</p></div>
                  </div>
                </div>
                <div className="mt-auto pt-6 border-t border-white/20">
                  <p className="text-sm mb-3">Already have an account?</p>
                  <Link href={route('customer.login')} className="block w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-center transition-colors">Sign In</Link>
                </div>
              </div>
            </div>
            <div className="w-3/5 p-8">
              <div className="h-full flex flex-col">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-unispa-ink">Create Account</h2>
                  <p className="text-unispa-subtle mt-1">Join thousands of students and staff</p>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                  <form onSubmit={submitRegistration} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-unispa-ink mb-3">Select User Type</label>
                      <div className="flex rounded-lg overflow-hidden border border-unispa-muted">
                        <button type="button" onClick={() => handleTabClick('uitm_member')}
                          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${activeTab === 'uitm_member' ? 'bg-unispa-primary text-white' : 'bg-white text-unispa-ink hover:bg-unispa-muted'}`}>UITM Member</button>
                        <button type="button" onClick={() => handleTabClick('regular')}
                          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${activeTab === 'regular' ? 'bg-unispa-primary text-white' : 'bg-white text-unispa-ink hover:bg-unispa-muted'}`}>Regular User</button>
                      </div>
                      <div className="mt-4">
                        {activeTab === 'uitm_member' && (
                          <div className="p-4 bg-unispa-muted rounded-lg">
                            <p className="text-sm font-medium text-unispa-ink mb-3">UITM Member Type</p>
                            <div className="flex space-x-6">
                              <label className="flex items-center">
                                <input type="radio" name="member_type" value="student" checked={memberType === 'student'} onChange={() => handleMemberTypeChange('student')} className="mr-2 text-unispa-primary" />
                                <span className="text-sm">Student</span>
                              </label>
                              <label className="flex items-center">
                                <input type="radio" name="member_type" value="staff" checked={memberType === 'staff'} onChange={() => handleMemberTypeChange('staff')} className="mr-2 text-unispa-primary" />
                                <span className="text-sm">Staff</span>
                              </label>
                            </div>
                          </div>
                        )}
                        {activeTab === 'regular' && (
                          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <p className="text-sm text-unispa-ink">Non-UITM users can register with any valid email address.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <InputLabel htmlFor="name" value="Username" className="text-sm font-medium text-unispa-ink mb-2" />
                      <input type="text" id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required placeholder="Enter username"
                        className="w-full border border-gray-300 focus:border-unispa-primary rounded-lg py-3 px-4" />
                      <InputError message={errors.name} className="mt-1 text-xs" />
                    </div>
                    <div>
                      <InputLabel htmlFor="email" value="Email" className="text-sm font-medium text-unispa-ink mb-2" />
                      <input type="email" id="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required
                        placeholder={activeTab === 'uitm_member' ? (memberType === 'staff' ? 'john.doe@staff.uitm.edu.my' : '2020123456@student.uitm.edu.my') : 'example@gmail.com'}
                        className="w-full border border-gray-300 focus:border-unispa-primary rounded-lg py-3 px-4" />
                      {emailError && <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-xs text-red-700">{emailError}</p></div>}
                      <InputError message={errors.email} className="mt-1 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <InputLabel htmlFor="phone" value="Phone" className="text-sm font-medium text-unispa-ink mb-2" />
                        <input type="text" id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} required placeholder="Phone number"
                          className="w-full border border-gray-300 focus:border-unispa-primary rounded-lg py-3 px-4" />
                        <InputError message={errors.phone} className="mt-1 text-xs" />
                      </div>
                      <div>
                        <InputLabel htmlFor="password" value="Password" className="text-sm font-medium text-unispa-ink mb-2" />
                        <input type="password" id="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required placeholder="••••••••"
                          className="w-full border border-gray-300 focus:border-unispa-primary rounded-lg py-3 px-4" />
                        <InputError message={errors.password} className="mt-1 text-xs" />
                      </div>
                    </div>
                    <div>
                      <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-sm font-medium text-unispa-ink mb-2" />
                      <input type="password" id="password_confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required placeholder="••••••••"
                        className="w-full border border-gray-300 focus:border-unispa-primary rounded-lg py-3 px-4" />
                    </div>
                    <div className="pt-4">
                      <button type="submit" disabled={processing || (activeTab === 'uitm_member' && !!emailError)}
                        className="w-full py-3 bg-unispa-primary hover:bg-unispa-primaryDark text-white rounded-lg font-medium transition disabled:opacity-50">
                        {processing ? 'Creating Account...' : 'Create Account'}
                      </button>
                    </div>
                    <div className="text-center text-sm text-unispa-subtle pt-2">
                      <p>Already have an account? <Link href={route('customer.login')} className="text-unispa-primary hover:underline">Sign In</Link></p>
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
