import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import ExpenseDetailModal from '../components/ExpenseDetailModal';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/api';
import { formatCurrency, getCategoryIcon, categories } from '../utils/formatters';
import { PlusCircle, Search, Eye, Edit2, Trash2, Filter, Receipt } from 'lucide-react';

const ExpensesPage = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const requestVersion = useRef(0);

  const getApprovalStageLabel = (exp) => {
    if (exp.status === 'approved') return 'Fully Approved';
    if (exp.status === 'rejected') return 'Rejected';
    if (exp.approvalStage === 'manager') {
      return exp.managerApproved ? 'Manager approved • Awaiting Finance audit' : 'Awaiting Manager review';
    }
    if (exp.approvalStage === 'finance') {
      return exp.financeApproved ? 'Finance approved • Awaiting Admin payment confirmation' : 'Awaiting Finance audit';
    }
    if (exp.approvalStage === 'admin') {
      return exp.adminApproved ? 'Admin payment confirmed' : 'Awaiting Admin payment confirmation';
    }
    if (exp.approvalStage === 'completed') {
      return 'Fully approved';
    }
    return 'Pending approval';
  };

  const formatExpenseDate = (date) => {
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
      ? 'Date unavailable'
      : parsedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const fetchExpenses = useCallback(async () => {
    const requestId = ++requestVersion.current;
    try {
      setLoading(true);
      const data = await expenseService.getExpenses({
        status: statusFilter,
        category: categoryFilter,
        date_range: dateFilter,
        search: debouncedSearch,
      });
      if (requestId === requestVersion.current) setExpenses(data.expenses || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      if (requestId === requestVersion.current) {
        showToast(err.response?.data?.error || err.message || 'Unable to load expenses.', 'error');
      }
    } finally {
      if (requestId === requestVersion.current) setLoading(false);
    }
  }, [categoryFilter, dateFilter, debouncedSearch, showToast, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pending expense?')) return;
    try {
      await expenseService.deleteExpense(id);
      showToast('Expense deleted successfully', 'success');
      fetchExpenses();
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Failed to delete expense', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Expense Directory</h1>
            <p className="text-sm text-slate-600">Track and manage all submitted expense claims</p>
          </div>
          <Link
            to="/submit"
            className="mt-4 sm:mt-0 inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> New Expense Claim
          </Link>
        </div>

        {/* Filters Bar */}
        <div className="glass rounded-3xl p-6 mb-8 border border-white/80 dark:bg-slate-800 dark:border-slate-700 shadow-lg fade-in">
          <div className="flex items-center text-xs font-bold text-slate-600 mb-4">
            <Filter className="w-4 h-4 mr-1.5 text-blue-600" /> Filter & Search Claims
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Status
              </label>
                <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800 dark:border-slate-600 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800 dark:border-slate-600 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800 dark:border-slate-600 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Search Query
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search description, vendor..."
                  className="w-full px-3.5 py-2.5 pl-9 bg-white/80 dark:bg-slate-800 dark:border-slate-600 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <section aria-label="Expense claims" className="glass rounded-2xl shadow-xl overflow-hidden border border-white/80 dark:bg-slate-800 dark:border-slate-700 fade-in">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4 dark:border-slate-700 sm:px-6">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">All expense claims</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {loading ? 'Loading claims…' : `${expenses.length} ${expenses.length === 1 ? 'claim' : 'claims'}`}
              </p>
            </div>
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300 sm:inline-flex">
              {statusFilter === 'all' ? 'All statuses' : `${statusFilter.charAt(0).toUpperCase()}${statusFilter.slice(1)}`}
            </span>
          </div>
          <p className="border-b border-slate-200/80 px-5 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400 sm:hidden">
            Scroll horizontally to view all columns.
          </p>
          <div
            className="overflow-x-auto overscroll-x-contain focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            tabIndex={0}
            role="region"
            aria-label="Scrollable expense claims table"
          >
            <table className="w-full min-w-[960px] table-fixed border-collapse text-left">
              <caption className="sr-only">Expense Description, Amount, Category, Date, Status, and Actions</caption>
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                  <th scope="col" className="w-[25%] px-6 py-4">Expense Description</th>
                  <th scope="col" className="w-[14%] px-6 py-4 text-right">Amount</th>
                  <th scope="col" className="w-[14%] px-6 py-4">Category</th>
                  <th scope="col" className="w-[12%] px-6 py-4">Date</th>
                  <th scope="col" className="w-[19%] px-6 py-4">Status</th>
                  <th scope="col" className="w-[16%] px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/60 text-xs dark:divide-slate-700 dark:bg-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400" role="status">Loading expenses…</td>
                  </tr>
                ) : expenses.length > 0 ? (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="transition-colors hover:bg-blue-50/60 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xl dark:border-slate-600 dark:bg-slate-700">
                            {getCategoryIcon(exp.category)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100" title={exp.description}>{exp.description || 'Untitled expense'}</p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400" title={exp.submittedBy ? `Submitted by ${exp.submittedBy}` : undefined}>
                              {exp.submittedBy ? `Submitted by ${exp.submittedBy}` : 'Submitter unavailable'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <p className="text-sm font-extrabold tabular-nums text-slate-800 dark:text-slate-100">
                          {formatCurrency(exp.amount, exp.currency)}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex max-w-full items-center truncate rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-slate-700 dark:text-slate-100" title={exp.category}>
                          {exp.category || 'Uncategorized'}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                        <time dateTime={exp.date}>{formatExpenseDate(exp.date)}</time>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                              exp.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300'
                                : exp.status === 'rejected'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300'
                            }`}
                          >
                            {exp.status || 'pending'}
                          </span>
                          {exp.status === 'pending' && (
                            <p className="text-[10px] font-semibold leading-4 text-slate-500 dark:text-slate-400">
                              {getApprovalStageLabel(exp)}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedExpense(exp)}
                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-300 dark:hover:bg-slate-700"
                            title="View details"
                            aria-label={`View ${exp.description || 'expense'} details`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {exp.status === 'pending' && user && user.id === exp.submittedById && (
                            <>
                              <button
                                onClick={() => navigate('/submit', { state: { editExpense: exp } })}
                                className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-emerald-300 dark:hover:bg-slate-700"
                                title="Edit"
                                aria-label={`Edit ${exp.description || 'expense'}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(exp.id)}
                                className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-rose-300 dark:hover:bg-slate-700"
                                title="Delete"
                                aria-label={`Delete ${exp.description || 'expense'}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-14 text-center text-slate-500 dark:text-slate-400">
                      <Receipt className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No expenses found</p>
                      <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or submit a new claim</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          currentUser={user}
          onClose={() => setSelectedExpense(null)}
          onEdit={(exp) => {
            setSelectedExpense(null);
            navigate('/submit', { state: { editExpense: exp } });
          }}
        />
      )}
    </div>
  );
};

export default ExpensesPage;
