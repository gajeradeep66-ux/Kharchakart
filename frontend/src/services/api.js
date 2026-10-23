import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach Bearer token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor — auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Only redirect if not already on an auth page
      const authPaths = ['/login', '/signup'];
      if (!authPaths.some((p) => window.location.pathname.startsWith(p))) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  verifyToken: async (token) => {
    const { data } = await api.post('/auth/verify', { token });
    return data;
  },
};

// User Services
export const userService = {
  getProfile: async () => {
    const { data } = await api.get('/users/profile');
    return data;
  },
  updateProfile: async (profileData) => {
    const { data } = await api.put('/users/profile', profileData);
    return data;
  },
  getAllUsers: async () => {
    const { data } = await api.get('/users');
    return data;
  },
  updateUserRole: async (userId, role) => {
    const { data } = await api.put(`/users/${userId}/role`, { role });
    return data;
  },
};

// Expense Services
export const expenseService = {
  getExpenses: async (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v && v !== 'all'))
    );
    const { data } = await api.get(`/expenses${params.toString() ? `?${params}` : ''}`);
    return data;
  },
  createExpense: async (expenseData) => {
    const { data } = await api.post('/expenses', expenseData);
    return data;
  },
  getExpenseById: async (id) => {
    const { data } = await api.get(`/expenses/${id}`);
    return data;
  },
  updateExpense: async (id, expenseData) => {
    const { data } = await api.put(`/expenses/${id}`, expenseData);
    return data;
  },
  deleteExpense: async (id) => {
    const { data } = await api.delete(`/expenses/${id}`);
    return data;
  },
  getExpenseStats: async () => {
    const { data } = await api.get('/expenses/stats');
    return data;
  },
  uploadReceipt: async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    const { data } = await api.post('/expenses/upload-receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

// Approval Services
export const approvalService = {
  getPendingApprovals: async () => {
    const { data } = await api.get('/approvals/pending');
    return data;
  },
  approveExpense: async (id) => {
    const { data } = await api.post(`/approvals/approve/${id}`);
    return data;
  },
  rejectExpense: async (id, reason) => {
    const { data } = await api.post(`/approvals/reject/${id}`, { reason });
    return data;
  },
  getApprovalStats: async () => {
    const { data } = await api.get('/approvals/stats');
    return data;
  },
};

// Notification Services
export const notificationService = {
  getNotifications: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },
  getUnreadCount: async () => {
    const { data } = await api.get('/notifications/unread');
    return data;
  },
  markAsRead: async (id) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },
  markAllAsRead: async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },
  deleteNotification: async (id) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },
  clearAllNotifications: async () => {
    const { data } = await api.delete('/notifications/clear-all');
    return data;
  },
};

export default api;
