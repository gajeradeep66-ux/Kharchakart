import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../utils/roleUtils';
import { Eye, EyeOff, ArrowLeft, TrendingUp, DollarSign, BarChart2, PieChart } from 'lucide-react';
import AuthThemeToggle from '../components/AuthThemeToggle';

const FinanceLoginPage = () => {
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
      if (!data?.user || normalizeRole(data.user.role) !== 'finance') {
        showToast('This account is not a finance user.', 'error');
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

  const features = [
    { icon: DollarSign, label: 'Budget Control', desc: 'Full spending visibility' },
    { icon: BarChart2, label: 'Expense Reports', desc: 'Export CSV anytime' },
    { icon: PieChart, label: 'Analytics', desc: 'Category breakdowns' },
    { icon: TrendingUp, label: 'Forecasting', desc: 'Monthly trend insights' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 sm:py-12 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-950 relative overflow-hidden transition-colors">
      <AuthThemeToggle />
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-950/50 border border-white/70 dark:border-emerald-900/40">
        {/* Left panel */}
        <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800 p-10 flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/20">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-3">
              Finance<br />
              <span className="text-emerald-200">Intelligence</span><br />
              Hub
            </h2>
            <p className="text-emerald-100/70 text-sm leading-relaxed">
              Full visibility into company-wide spending, approvals, and financial reporting.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/10 border border-white/15 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 text-emerald-200" />
                  <p className="text-white text-xs font-bold">{label}</p>
                </div>
                <p className="text-emerald-100/80 text-xs">{desc}</p>
              </div>
            ))}
          </div>

          <Link to="/login" className="mt-8 inline-flex items-center gap-2 text-xs text-emerald-200 hover:text-white font-semibold transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to User Login
          </Link>
        </div>

        {/* Right panel */}
        <div className="bg-white/95 dark:bg-slate-900 p-7 sm:p-10 flex flex-col justify-center transition-colors">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-4">
              Finance Portal
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Access Dashboard</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to review financial reports and approvals.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Finance Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-sm"
                placeholder="finance@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition pr-12 text-sm"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Authenticating...' : '💰 Sign in as Finance'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinanceLoginPage;
