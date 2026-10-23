import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import { formatTimeAgo } from '../utils/formatters';
import { isEmployeeRole } from '../utils/roleUtils';
import {
  Bell,
  CheckSquare,
  Home,
  PlusCircle,
  Receipt,
  BarChart3,
  User,
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  BellOff,
  Menu,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { user, logout, showToast } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.notifications || []);
      const countRes = await notificationService.getUnreadCount();
      setUnreadCount(countRes.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      showToast(err.response?.data?.error || 'Unable to load notifications.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      showToast(err.response?.data?.error || 'Unable to mark notification as read.', 'error');
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      showToast('Notifications cleared', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Unable to clear notifications.', 'error');
    }
  };

  const handleDismissNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      fetchNotifications();
    } catch (err) {
      showToast(err.response?.data?.error || 'Unable to delete notification.', 'error');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="glass border-b border-white/40 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Nav */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">
                <span className="gradient-text">Kharcha</span>
                <span className="text-indigo-600">Kart</span>
              </h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/dashboard')
                    ? 'text-blue-600 bg-blue-50/80 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Home className="w-4 h-4 mr-1.5" />
                Dashboard
              </Link>
              <Link
                to="/submit"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/submit')
                    ? 'text-blue-600 bg-blue-50/80 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Submit
              </Link>
              <Link
                to="/expenses"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/expenses')
                    ? 'text-blue-600 bg-blue-50/80 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Receipt className="w-4 h-4 mr-1.5" />
                Expenses
              </Link>
              {user && !isEmployeeRole(user.role) && (
                <Link
                  to="/approvals"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                    isActive('/approvals')
                      ? 'text-blue-600 bg-blue-50/80 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 mr-1.5" />
                  Approvals
                </Link>
              )}
              <Link
                to="/analytics"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/analytics')
                    ? 'text-blue-600 bg-blue-50/80 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-1.5" />
                Analytics
              </Link>
            </nav>
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification Menu */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-panel absolute right-0 mt-2 w-80 max-w-[calc(100vw_-_2rem)] sm:w-96 glass rounded-2xl shadow-2xl border z-50 overflow-hidden fade-in">
                  <div className="notification-panel__header px-5 py-3.5 border-b flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center">
                      <Bell className="w-4 h-4 mr-2 text-blue-600" />
                      Notifications
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="notification-panel__list max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkAsRead(notif.id)}
                          className={`notification-panel__item p-4 transition-colors cursor-pointer flex items-start space-x-3 ${
                            !notif.read ? 'notification-panel__item--unread' : ''
                          }`}
                        >
                          <div className="mt-0.5">
                            {notif.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                            {notif.type === 'error' && <XCircle className="w-5 h-5 text-rose-500" />}
                            {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                            {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{notif.title}</p>
                              {!notif.read && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2" title={notif.message}>{notif.message}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-slate-400 font-medium">
                                {formatTimeAgo(notif.timestamp)}
                              </span>
                              <button
                                onClick={(e) => handleDismissNotif(e, notif.id)}
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center px-4">
                        <BellOff className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-500">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center text-base shadow-sm border border-white">
                    {user.avatar || '👤'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{user.role} • {user.department}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-2xl border border-white/60 z-50 py-2 fade-in">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 dark:bg-transparent">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-blue-100 text-blue-700">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50/80 hover:text-blue-600 transition-colors"
                      >
                        <User className="w-4 h-4 mr-2.5" />
                        Profile Settings
                      </Link>
                      <Link
                        to="/analytics"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50/80 hover:text-blue-600 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 mr-2.5" />
                        Analytics Dashboard
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50/80 hover:text-blue-600 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-2.5" />
                        Settings
                      </Link>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileMenu && (
          <div className="md:hidden py-3 px-2 border-t border-slate-100 space-y-1 fade-in">
            <Link
              to="/dashboard"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/dashboard')
                  ? 'text-blue-600 bg-blue-50 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4 mr-2.5" />
              Dashboard
            </Link>
            <Link
              to="/submit"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/submit')
                  ? 'text-blue-600 bg-blue-50 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 mr-2.5" />
              Submit Expense
            </Link>
            <Link
              to="/expenses"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/expenses')
                  ? 'text-blue-600 bg-blue-50 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-4 h-4 mr-2.5" />
              Expenses Directory
            </Link>
            {user && !isEmployeeRole(user.role) && (
              <Link
                to="/approvals"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/approvals')
                    ? 'text-blue-600 bg-blue-50 font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CheckSquare className="w-4 h-4 mr-2.5" />
                Review Approvals
              </Link>
            )}
            <Link
              to="/analytics"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/analytics')
                  ? 'text-blue-600 bg-blue-50 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2.5" />
              Analytics
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
