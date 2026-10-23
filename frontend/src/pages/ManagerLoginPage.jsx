import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../utils/roleUtils';
import { Eye, EyeOff, ArrowLeft, Users, ClipboardCheck, Bell, ChevronRight } from 'lucide-react';
import AuthThemeToggle from '../components/AuthThemeToggle';

const FEATURES = [
  { icon: ClipboardCheck, title: 'Approve Expenses', desc: 'Review & action team claims' },
  { icon: Users, title: 'Team Overview', desc: 'Monitor all team spending' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Pending approval notifications' },
];

const ManagerLoginPage = () => {
  const navigate = useNavigate();
  const { login, logout, showToast } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await login(email, password);
      if (!data?.user || normalizeRole(data.user.role) !== 'manager') {
        showToast('This account is not a manager.', 'error');
        logout();
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 sm:py-12 relative overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-100 dark:from-slate-950 dark:via-cyan-950 dark:to-slate-950 transition-colors">
      <AuthThemeToggle />

      {/* Animated wave lines */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, #0ea5e9 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #06b6d4 0%, transparent 50%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      {/* Glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-white/70 dark:border-cyan-900/30 shadow-2xl shadow-cyan-950/20 dark:shadow-cyan-950/50">
        {/* Left */}
        <div className="bg-gradient-to-br from-[#001a2e] via-[#002a45] to-[#00080f] p-10 flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-900/50">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-3">
              Manager<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">Command</span><br />
              Panel
            </h2>
            <p className="text-cyan-100/80 text-sm">Lead your team&apos;s expense workflow with full visibility.</p>
          </div>

          <div className="space-y-3 mt-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 bg-cyan-900/10 border border-cyan-800/20 rounded-xl px-4 py-3 group hover:border-cyan-600/30 transition">
                <div className="w-8 h-8 bg-cyan-900/40 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-cyan-200 text-xs font-bold">{title}</p>
                  <p className="text-cyan-100/70 text-xs">{desc}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-700 group-hover:text-cyan-500 transition" />
              </div>
            ))}
          </div>

          <Link to="/login" className="mt-8 inline-flex items-center gap-2 text-xs text-cyan-200/80 hover:text-white font-semibold transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to User Login
          </Link>
        </div>

        {/* Right */}
        <div className="bg-white/95 dark:bg-slate-900 p-7 sm:p-10 flex flex-col justify-center transition-colors">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-800 dark:bg-cyan-500/15 dark:border-cyan-500/30 dark:text-cyan-300 text-xs font-bold uppercase tracking-widest mb-4">
              Manager Portal
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Team Sign In</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Access your team&apos;s expense management dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-cyan-300 mb-2 uppercase tracking-wider">Manager Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition text-sm"
                placeholder="manager@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-cyan-300 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition pr-12 text-sm"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 dark:text-cyan-700 dark:hover:text-cyan-400" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-950/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Authenticating...' : '👥 Sign in as Manager'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerLoginPage;
