import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap, Shield, TrendingUp, Users } from 'lucide-react';
import AuthThemeToggle from '../components/AuthThemeToggle';

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 2.5 + 1,
  delay: Math.random() * 3,
  opacity: Math.random() * 0.5 + 0.4,
}));

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const portals = [
    { label: 'Owner', icon: Shield, path: '/login/admin', color: 'from-red-500 to-rose-600', glow: 'shadow-red-500/40' },
    { label: 'Finance', icon: TrendingUp, path: '/login/finance', color: 'from-amber-400 to-yellow-500', glow: 'shadow-amber-400/40' },
    { label: 'Manager', icon: Users, path: '/login/manager', color: 'from-cyan-400 to-blue-500', glow: 'shadow-cyan-400/40' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-100 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 flex items-center justify-center px-4 py-20 sm:py-12 relative overflow-hidden transition-colors">
      <AuthThemeToggle />
      {/* Animated stars */}
      {STARS.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-indigo-500/40 dark:bg-white animate-pulse"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.opacity, animationDelay: `${s.delay}s` }}
        />
      ))}

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-white/70 dark:border-white/10 shadow-2xl shadow-indigo-900/15 dark:shadow-indigo-900/50">
        {/* Left panel */}
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">KharchaKart</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Manage<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Expenses</span><br />
              Effortlessly.
            </h2>
            <p className="text-indigo-100/85 text-sm leading-relaxed">
              Multi-currency tracking, smart approvals, and real-time analytics — all in one place.
            </p>
          </div>

          {/* Role portals */}
          <div className="mt-10">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-4">Special Portals</p>
            <div className="flex flex-col gap-3">
              {portals.map(({ label, icon: Icon, path, color, glow }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r ${color} shadow-lg ${glow} hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}
                >
                  <Icon className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white">{label} Portal</span>
                  <span className="ml-auto text-white/60 text-xs">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-white/95 dark:bg-slate-900 p-7 sm:p-10 flex flex-col justify-center transition-colors">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400 mb-2">Employee portal</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Welcome back</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to your employee account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-900/15 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
            No account?{' '}
            <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-500 dark:hover:text-indigo-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
