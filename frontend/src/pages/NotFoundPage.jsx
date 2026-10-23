import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import AuthThemeToggle from '../components/AuthThemeToggle';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 text-center relative overflow-hidden">
      <AuthThemeToggle />
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bounce-in">
        {/* Big 404 */}
        <div className="mb-6">
          <p className="text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 select-none">
            404
          </p>
        </div>

        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Compass className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Page Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved to a different location.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
