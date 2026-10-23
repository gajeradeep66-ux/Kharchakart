import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Sparkles, CheckCircle } from 'lucide-react';
import AuthThemeToggle from '../components/AuthThemeToggle';

const PERKS = [
  'Multi-currency expense tracking',
  'Smart approval workflows',
  'Real-time analytics & CSV export',
  'Receipt attachment support',
];

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, showToast } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', department: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (form.password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({ name: `${form.firstName.trim()} ${form.lastName.trim()}`, email: form.email, password: form.password, department: form.department });
      navigate('/dashboard');
    } catch {
      // error already shown via showToast in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-sm';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 sm:py-12 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-950 transition-colors">
      <AuthThemeToggle />

      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-300/40 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-teal-300/30 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-5 gap-0 rounded-3xl overflow-hidden border border-white/70 dark:border-white/10 shadow-2xl shadow-emerald-900/15">
        {/* Left branding panel */}
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-700 p-7 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-6 h-6 text-emerald-200" />
              <span className="text-xl font-black text-white">KharchaKart</span>
            </div>
            <h2 className="text-3xl font-black text-white leading-snug mb-3">
              Join your<br />team today.
            </h2>
            <p className="text-emerald-200 text-sm">Everything you need to manage expenses at scale.</p>
          </div>
          <ul className="space-y-3 mt-8">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-emerald-100">
                <CheckCircle className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
          <p className="text-emerald-100/75 text-xs mt-8">Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Right form panel */}
        <div className="md:col-span-3 bg-white/95 dark:bg-slate-900 backdrop-blur-sm p-7 sm:p-10 transition-colors">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400 mb-2">Get started</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Create account</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-7">Fill in your details to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-first-name" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">First Name</label>
                <input id="signup-first-name" type="text" autoComplete="given-name" required value={form.firstName} onChange={set('firstName')} className={inputCls} placeholder="John" />
              </div>
              <div>
                <label htmlFor="signup-last-name" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Last Name</label>
                <input id="signup-last-name" type="text" autoComplete="family-name" required value={form.lastName} onChange={set('lastName')} className={inputCls} placeholder="Doe" />
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Email Address</label>
              <input id="signup-email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} className={inputCls} placeholder="john@company.com" />
            </div>

            <div>
              <label htmlFor="signup-department" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Department</label>
              <select id="signup-department" required value={form.department} onChange={set('department')} className={inputCls}>
                <option value="">Select Department</option>
                {['Sales', 'Marketing', 'Engineering', 'Operations', 'Finance', 'HR', 'Administration'].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={form.password} onChange={set('password')} className={`${inputCls} pr-10`} placeholder="At least 8 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input id="signup-confirm-password" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" required value={form.confirmPassword} onChange={set('confirmPassword')} className={`${inputCls} pr-10`} placeholder="Re-enter your password" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300" aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
