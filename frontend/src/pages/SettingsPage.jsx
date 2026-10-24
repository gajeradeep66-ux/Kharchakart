import React from 'react';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { Settings, Moon, Sun, Bell, Check } from 'lucide-react';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pb-12">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center">
            <Settings className="w-8 h-8 text-indigo-600 mr-3" /> Display Preferences
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Choose how KharchaKart appears on this device.
          </p>
        </div>

        <div className="glass rounded-3xl shadow-xl p-6 sm:p-8 border border-white/80 dark:border-slate-700 fade-in space-y-8">
          <section aria-labelledby="theme-heading">
            <h2 id="theme-heading" className="block text-sm font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-3">
              Interface theme
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTheme('light')}
                aria-pressed={theme === 'light'}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  theme === 'light'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold shadow-md'
                    : 'bg-white/80 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200'
                }`}
              >
                <span className="flex items-center text-sm">
                  <Sun className="w-4 h-4 mr-2 text-amber-500" /> Light mode
                </span>
                {theme === 'light' && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-pressed={theme === 'dark'}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-white border-slate-700 font-bold shadow-md'
                    : 'bg-white/80 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200'
                }`}
              >
                <span className="flex items-center text-sm">
                  <Moon className="w-4 h-4 mr-2 text-indigo-400" /> Dark mode
                </span>
                {theme === 'dark' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Your theme choice is saved in this browser and applies across the app.
            </p>
          </section>

          <section className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">In-app notifications</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Expense and approval updates appear in the notification menu. Notification preferences are not currently configurable.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
