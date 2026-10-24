import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthThemeToggle from '../components/AuthThemeToggle';
import {
  ScanLine,
  Users2,
  Globe2,
  BarChart3,
  LogIn,
  UserPlus,
  ArrowRight,
  Shield,
  TrendingUp,
  Briefcase,
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <AuthThemeToggle />
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-full opacity-20 float"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-amber-300 to-pink-500 rounded-full opacity-10 float"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto text-center slide-up relative z-10 py-12">
        {/* Logo and Brand Heading */}
        <div className="mb-12">
          <div className="bounce-in">
            <div className="flex items-center justify-center mb-6">
              <svg width="60" height="60" viewBox="0 0 80 80" className="mr-4 drop-shadow-xl">
                <rect x="15" y="25" width="45" height="30" rx="6" fill="#6366F1" stroke="#4338CA" strokeWidth="2" />
                <path d="M10 20 L15 20 L18 45 L55 45" stroke="#4338CA" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <circle cx="25" cy="60" r="6" fill="#4F46E5" stroke="#4338CA" strokeWidth="2" />
                <circle cx="50" cy="60" r="6" fill="#4F46E5" stroke="#4338CA" strokeWidth="2" />
                <circle cx="37.5" cy="40" r="12" fill="#4338CA" />
                <text x="37.5" y="46" textAnchor="middle" fontStyle="Inter, sans-serif" fontSize="14" fontWeight="bold" fill="#FFFFFF">
                  ₹
                </text>
              </svg>
              <div className="text-left">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                  <span className="gradient-text">Kharcha</span>
                  <span className="text-indigo-600 dark:text-indigo-400">Kart</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest">
                  Smart Expense Management
                </p>
              </div>
            </div>

            <p className="text-2xl sm:text-3xl text-slate-700 dark:text-slate-200 mb-4 font-bold tracking-tight">
              Smart Expense Management • Reimagined
            </p>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Track expense claims, attach receipts, and follow each claim through role-based approval steps.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="glass rounded-3xl p-6 card-hover pulse-glow border border-white/60 dark:border-slate-700/60 shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md text-white">
                  <ScanLine className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">Receipt Attachments</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Attach an image or PDF receipt to an expense claim
                </p>
              </div>

              <div className="glass rounded-3xl p-6 card-hover border border-white/60 dark:border-slate-700/60 shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md text-white">
                  <Users2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">Smart Approvals</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Role-based manager, finance, and owner review steps
                </p>
              </div>

              <div className="glass rounded-3xl p-6 card-hover border border-white/60 dark:border-slate-700/60 shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md text-white">
                  <Globe2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">Multi-Currency Claims</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Record claims in supported currencies; totals remain in the submitted currency
                </p>
              </div>

              <div className="glass rounded-3xl p-6 card-hover border border-white/60 dark:border-slate-700/60 shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md text-white">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">Advanced Analytics</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Review claim counts, approval status, and CSV exports
                </p>
              </div>
            </div>
          </div>

          {/* Authentication Action Box */}
          <div className="glass rounded-3xl shadow-2xl p-8 sm:p-10 max-w-lg mx-auto bounce-in border border-white/80 dark:border-slate-700 dark:bg-slate-900/80">
            {user ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  {user.avatar || '👤'}
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Welcome back, {user.name}!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{user.email}</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center group"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">Get Started</h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Start tracking your team&apos;s expenses and approvals
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center group"
                  >
                    <LogIn className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Sign In to Your Account
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center group"
                  >
                    <UserPlus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Create New Account
                  </button>

                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Special Portals</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Owner', icon: Shield, path: '/login/admin', color: 'from-violet-600 to-purple-600' },
                        { label: 'Finance', icon: TrendingUp, path: '/login/finance', color: 'from-emerald-600 to-teal-600' },
                        { label: 'Manager', icon: Briefcase, path: '/login/manager', color: 'from-cyan-500 to-blue-600' },
                      ].map(({ label, icon: Icon, path, color }) => (
                        <button
                          key={label}
                          onClick={() => navigate(path)}
                          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl bg-gradient-to-br ${color} text-white font-bold text-xs shadow-md hover:scale-[1.04] active:scale-[0.97] transition-all`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
