import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../utils/roleUtils';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Lock, Users, Zap } from 'lucide-react';
import AuthThemeToggle from '../components/AuthThemeToggle';

const AdminLoginPage = () => {
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
        if (!data?.user || normalizeRole(data.user.role) !== 'owner') {
            showToast('This account is not an owner.', 'error');
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
        <div className="min-h-screen flex items-center justify-center px-4 py-20 sm:py-12 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 dark:from-slate-950 dark:via-violet-950 dark:to-slate-950 relative overflow-hidden transition-colors">
        <AuthThemeToggle />
        {/* Subtle grid overlay */}
        <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
            backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            }}
        />
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-violet-950/15 dark:shadow-violet-950/60 border border-white/70 dark:border-violet-800/30">
            {/* Left panel */}
            <div className="bg-gradient-to-br from-violet-900/80 via-purple-900/60 to-slate-900/80 backdrop-blur-sm p-10 flex flex-col justify-between border-r border-violet-800/20">
            <div>
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-900/50">
                <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-4xl font-black text-white leading-tight mb-3">
                Owner<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-purple-300">Control</span><br />
                Center
                </h2>
                <p className="text-violet-100/80 text-sm leading-relaxed">
                Restricted access portal. Full system control, user management, and payment confirmation.
                </p>
            </div>

            <div className="space-y-3 mt-8">
                {[
                { icon: Users, label: 'User Management', desc: 'All roles & permissions' },
                { icon: Lock, label: 'Security Level', desc: 'Maximum clearance' },
                { icon: Zap, label: 'System Access', desc: 'Full platform control' },
                ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3 bg-violet-900/30 border border-violet-700/20 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-violet-800/50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-violet-300" />
                    </div>
                    <div>
                    <p className="text-violet-200 text-xs font-bold">{label}</p>
                    <p className="text-violet-100/70 text-xs">{desc}</p>
                    </div>
                </div>
                ))}
            </div>

            <Link to="/login" className="mt-8 inline-flex items-center gap-2 text-xs text-violet-200/80 hover:text-white font-semibold transition">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to User Login
            </Link>
            </div>

            {/* Right panel */}
            <div className="bg-white/95 dark:bg-slate-900 backdrop-blur-sm p-7 sm:p-10 flex flex-col justify-center transition-colors">
            <div className="mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-800 dark:bg-violet-500/15 dark:border-violet-500/30 dark:text-violet-300 text-xs font-bold uppercase tracking-widest mb-4">
                    Owner Login
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Secure Sign In</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Credentials are verified against the owner role.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-violet-300 mb-2 uppercase tracking-wider">Owner Email</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition text-sm"
                    placeholder="admin@company.com"
                />
                </div>
                <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-violet-300 mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                    <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition pr-12 text-sm"
                    placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 dark:text-slate-500 dark:hover:text-violet-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                </div>

                <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-900/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {isSubmitting ? 'Authenticating...' : '🔐 Sign in as Owner'}
                </button>
            </form>
            </div>
        </div>
        </div>
    );
};

export default AdminLoginPage;
