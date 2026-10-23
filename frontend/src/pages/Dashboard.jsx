import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import ExpenseDetailModal from '../components/ExpenseDetailModal';
import RejectModal from '../components/RejectModal';
import { useAuth } from '../context/AuthContext';
import { expenseService, approvalService } from '../services/api';
import { formatCurrency, formatCurrencyTotals, getExpensesThisMonth, getCategoryIcon } from '../utils/formatters';
import { isEmployeeRole, normalizeRole } from '../utils/roleUtils';
import {
  Receipt,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
  PlusCircle,
  List,
  CheckSquare,
  BarChart3,
  Activity,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Building,
  Shield,
  Calendar,
} from 'lucide-react';

const Dashboard = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const expData = await expenseService.getExpenses();
      setExpenses(expData.expenses || []);

      const statsData = await expenseService.getExpenseStats();
      setStats(statsData);

      if (user && !isEmployeeRole(user.role)) {
        const appRes = await approvalService.getPendingApprovals();
        setPendingApprovalsCount((appRes.expenses || []).length);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      showToast(err.response?.data?.error || err.message || 'Unable to load dashboard data.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast, user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const handleApprove = async (id) => {
    try {
      await approvalService.approveExpense(id);
      showToast('Expense approved successfully', 'success');
      setSelectedExpense(null);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to approve', 'error');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await approvalService.rejectExpense(id, reason);
      showToast('Expense rejected', 'info');
      setSelectedExpense(null);
      setRejectTarget(null);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to reject', 'error');
    }
  };

  const approvedCount = expenses.filter((e) => e.status === 'approved').length;
  const pendingCount = expenses.filter((e) => e.status === 'pending').length;
  const thisMonthExpenses = getExpensesThisMonth(expenses);

  const getPendingLabel = () => {
    const normalizedRole = normalizeRole(user?.role);
    if (normalizedRole === 'manager') return 'Pending Manager Review';
    if (normalizedRole === 'finance') return 'Pending Finance Audit';
    if (normalizedRole === 'owner') return 'Pending Owner Confirmation';
    return 'Pending Review';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && <p className="text-sm text-slate-600 dark:text-slate-400 mb-4" role="status">Loading dashboard data…</p>}
        {/* Welcome Section */}
        <div className="mb-8 fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white/70 dark:bg-slate-800 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/80 dark:border-slate-700 shadow-lg">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center mb-2">
                Welcome back, {user?.name}!
                <span className="text-3xl ml-3">{user?.avatar || '👨‍💼'}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center">
                  <Building className="w-4 h-4 mr-1 text-blue-600" />
                  {user?.department}
                </span>
                <span className="flex items-center capitalize">
                  <Shield className="w-4 h-4 mr-1 text-indigo-600" />
                  {user?.role}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-purple-600" />
                  {user?.joinDate && `Member since ${new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                </span>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 text-center sm:text-right border border-white/60 dark:bg-transparent dark:border-slate-700">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Claim amounts by currency</p>
              <p className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100">
                {formatCurrencyTotals(expenses) || 'No claims yet'}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">{expenses.length} transaction records</p>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-3xl p-6 card-hover border border-white/70 dark:bg-slate-800 dark:border-slate-700 shadow-lg fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{expenses.length}</p>
                <p className="text-xs font-bold text-blue-600">Total Submissions</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>This Month: {thisMonthExpenses.length}</span>
              <span className="text-slate-500 font-medium">All time</span>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 card-hover border border-white/70 dark:bg-slate-800 dark:border-slate-700 shadow-lg fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{approvedCount}</p>
                <p className="text-xs font-bold text-emerald-600">Approved</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Approval Rate</span>
              <span className="text-emerald-600 font-bold">{Math.round(stats?.approval_rate || 0)}%</span>
            </div>
            <div className="mt-3 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats?.approval_rate || 0}%` }}></div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 card-hover border border-white/70 dark:bg-slate-800 dark:border-slate-700 shadow-lg fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{thisMonthExpenses.length}</p>
                <p className="text-xs font-bold text-amber-600">Submitted This Month</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Claim amounts</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-right">
                {formatCurrencyTotals(thisMonthExpenses) || 'No claims yet'}
              </span>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 card-hover border border-white/70 dark:bg-slate-800 dark:border-slate-700 shadow-lg fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                  {!isEmployeeRole(user?.role) ? pendingApprovalsCount : pendingCount}
                </p>
                <p className="text-xs font-bold text-purple-600">
                  {!isEmployeeRole(user?.role) ? getPendingLabel() : 'Pending Review'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Action Status</span>
              {(!isEmployeeRole(user?.role) ? pendingApprovalsCount : pendingCount) > 0 ? (
                <span className="text-rose-600 font-bold animate-pulse">Needs Review</span>
              ) : (
                <span className="text-emerald-600 font-bold">All Clear</span>
              )}
            </div>
            <div className="mt-3 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full"
                style={{ width: (!isEmployeeRole(user?.role) ? pendingApprovalsCount : pendingCount) > 0 ? '100%' : '0%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Actions Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass rounded-3xl p-6 shadow-xl border border-white/80 dark:bg-slate-800 dark:border-slate-700 fade-in">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-md">
                  <Zap className="w-4 h-4" />
                </div>
                Quick Actions
              </h2>

              <div className="space-y-3">
                <Link
                  to="/submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-between group text-sm"
                >
                  <span className="flex items-center">
                    <PlusCircle className="w-4 h-4 mr-2.5" /> Submit New Expense
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/expenses"
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white py-3.5 px-5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-between group text-sm"
                >
                  <span className="flex items-center">
                    <List className="w-4 h-4 mr-2.5" /> View All Expenses
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {user && !isEmployeeRole(user.role) && (
                  <Link
                    to="/approvals"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3.5 px-5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-between group text-sm relative"
                  >
                    <span className="flex items-center">
                      <CheckSquare className="w-4 h-4 mr-2.5" /> Review Approvals
                    </span>
                    <div className="flex items-center">
                      {pendingApprovalsCount > 0 && (
                        <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold mr-2">
                          {pendingApprovalsCount}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                )}

                <Link
                  to="/analytics"
                  className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white py-3.5 px-5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-between group text-sm"
                >
                  <span className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2.5" /> View Analytics
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Quick Metrics */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Summary Metrics
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-blue-50/70 dark:bg-slate-700 p-3 rounded-2xl border border-blue-100 dark:border-slate-700">
                    <p className="text-blue-600 font-bold">Submitted This Week</p>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                      {expenses.filter((e) => {
                        const expenseTime = new Date(e.date).getTime();
                        const age = Date.now() - expenseTime;
                        return Number.isFinite(expenseTime) && age >= 0 && age <= 7 * 86400000;
                      }).length}
                    </p>
                  </div>
                  <div className="bg-emerald-50/70 dark:bg-slate-700 p-3 rounded-2xl border border-emerald-100 dark:border-slate-700">
                    <p className="text-emerald-600 font-bold">Rejected Claims</p>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{stats?.rejected_count || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Panel */}
          <div className="lg:col-span-8">
            <div className="glass rounded-3xl p-6 shadow-xl border border-white/80 dark:bg-slate-800 dark:border-slate-700 fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-md">
                    <Activity className="w-4 h-4" />
                  </div>
                  Recent Expense Activity
                </h2>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={fetchDashboardData}
                    className={`p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all ${
                      refreshing ? 'animate-spin' : ''
                    }`}
                    title="Refresh data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <Link
                    to="/expenses"
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100"
                  >
                    View All <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Expense List */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                {expenses.length > 0 ? (
                  expenses.slice(0, 7).map((exp) => (
                    <div
                      key={exp.id}
                      onClick={() => setSelectedExpense(exp)}
                      className="expense-item flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3.5 sm:flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0 border border-blue-100 dark:border-slate-700">
                          {getCategoryIcon(exp.category)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex min-w-0 items-start gap-2">
                            <h3 className="line-clamp-2 break-words text-sm font-bold text-slate-800 dark:text-slate-100" title={exp.description}>{exp.description || 'Untitled expense'}</h3>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                                exp.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : exp.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {exp.status}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                            <span className="font-semibold text-slate-600">{exp.category || 'Uncategorized'}</span>
                            <span>{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            {exp.submittedBy && <span className="break-words">By {exp.submittedBy}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-4">
                        <div className="text-right">
                          <p className="font-black text-slate-800 dark:text-slate-100 text-base">
                            {formatCurrency(exp.amount, exp.currency)}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400">{exp.currency || 'INR'} (original currency)</p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExpense(exp);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-base font-bold text-slate-700 mb-1">No Activity Yet</p>
                    <p className="text-xs text-slate-500 mb-4">Submit your first expense claim to start tracking</p>
                    <Link
                      to="/submit"
                      className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" /> Submit Expense
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          currentUser={user}
          onClose={() => setSelectedExpense(null)}
          onApprove={handleApprove}
          onReject={(id) => {
            const exp = expenses.find((e) => e.id === id);
            setSelectedExpense(null);
            setRejectTarget(exp || { id });
          }}
          onEdit={(exp) => {
            setSelectedExpense(null);
            navigate('/submit', { state: { editExpense: exp } });
          }}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectTarget && (
        <RejectModal
          expenseDescription={rejectTarget.description}
          onConfirm={(reason) => handleReject(rejectTarget.id, reason)}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
