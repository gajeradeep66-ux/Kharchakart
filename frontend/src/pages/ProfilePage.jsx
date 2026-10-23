import React, { useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { User, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [avatar, setAvatar] = useState(user?.avatar || '👤');
  const [isSaving, setIsSaving] = useState(false);

  const avatarsList = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💰', '👤', '🚀', '🎯', '⚡'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name, department, avatar });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pb-12">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center">
            <User className="w-8 h-8 text-blue-600 mr-3" /> Profile Settings
          </h1>
          <p className="text-sm text-slate-600 mt-1">Manage your account information and preferences</p>
        </div>

        <div className="glass rounded-3xl shadow-xl p-8 border border-white/80 dark:bg-slate-800 dark:border-slate-700 fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Choose Avatar Emoji
              </label>
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl shadow-md border border-white dark:bg-slate-700 dark:border-slate-600">
                  {avatar}
                </div>
                <div className="flex flex-wrap gap-2">
                  {avatarsList.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-transform ${
                          avatar === emoji
                            ? 'bg-blue-600 text-white scale-110 shadow-md'
                            : 'bg-white/80 hover:bg-slate-100 border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 dark:text-slate-100'
                        }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Email (Readonly) */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl text-slate-500 bg-slate-100/80 dark:bg-slate-800 text-sm font-medium cursor-not-allowed"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-bold focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-800 dark:border-slate-600"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Department *
              </label>
              <select
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-bold focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-800 dark:border-slate-600"
              >
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="HR">Human Resources</option>
                <option value="Administration">Administration</option>
              </select>
            </div>

            {/* Role & Permissions (Readonly Box) */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Assigned System Role:</span>
                <span className="font-extrabold uppercase px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  {user?.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Approval Limit:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">
                  ₹{user?.approvalLimit ? user.approvalLimit.toLocaleString() : '0'}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-1">Active Permissions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {user?.permissions?.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    >
                      ✓ {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
