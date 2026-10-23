import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const toastTimeout = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ message, type, id: Date.now() });
    toastTimeout.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => () => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
  }, []);

  // Define logout before useEffect so it can be safely referenced
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.verifyToken(storedToken);
        if (res.valid && res.user) {
          setUser(res.user);
          setToken(storedToken);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, [logout]);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return data;
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || 'Login failed';
      showToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Welcome, ${data.user.name}! Account created.`, 'success');
      return data;
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || 'Registration failed';
      showToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await userService.updateProfile(profileData);
      setUser(data.user);
      showToast('Profile updated successfully', 'success');
      return data;
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || 'Update failed';
      showToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  const toastIcons = { success: '✓', error: '✕', warning: '⚠', info: 'i' };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, showToast }}>
      {children}

      {toast && (
        <div className="toast-container" key={toast.id}>
          <div className={`toast toast--${toast.type} bounce-in`} role="alert" aria-live="assertive">
            <div className="toast-icon">{toastIcons[toast.type] || 'i'}</div>
            <div className="toast-body">{toast.message}</div>
            <button onClick={() => setToast(null)} className="toast-close" aria-label="Close">×</button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
