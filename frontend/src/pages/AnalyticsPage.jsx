import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/api';
import { formatCurrencyTotals, getExpensesThisMonth, categories } from '../utils/formatters';
import { BarChart3, PieChart, Download, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';

const AnalyticsPage = () => {
  const { showToast } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expRes = await expenseService.getExpenses();
        setExpenses(expRes.expenses || []);
        const statRes = await expenseService.getExpenseStats();
        setStats(statRes);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        showToast(err.response?.data?.error || err.message || 'Unable to load analytics.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  // Category Breakdown Calculations
  const categoryTotals = categories.map((cat) => {
    const count = expenses.filter((e) => e.category === cat.name).length;
    return {
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      count,
    };
  }).filter((c) => c.count > 0);

  const thisMonthExpenses = getExpensesThisMonth(expenses);

  // CSV Export helper
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      showToast('No expenses available to export', 'error');
      return;
    }

    const headers = ['ID', 'Description', 'Amount', 'Currency', 'Category', 'Date', 'Status', 'Submitted By'];
    const rows = expenses.map((e) => [
      e.id,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      e.currency,
      e.category,
      e.date,
      e.status,
      `"${e.submittedBy.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kharchakart_expenses_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV Expense report downloaded successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8" aria-busy={loading}>
        {loading && <p className="text-sm text-slate-600 dark:text-slate-400 mb-4" role="status">Loading analytics…</p>}
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center">
              <BarChart3 className="w-8 h-8 text-indigo-600 mr-3" /> Analytics & Financial Insights
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Claim volumes by category and submitted-currency totals
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="mt-4 sm:mt-0 inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV Report
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 fade-in">
          <div className="glass rounded-3xl p-6 border border-white/80 dark:bg-slate-800 dark:border-slate-700 shadow-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Claimed Amounts by Currency</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">
                  {formatCurrencyTotals(expenses) || 'No claims yet'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Across {expenses.length} claims submitted</p>
          </div>

          <div className="glass rounded-3xl p-6 border border-white/80 dark:bg-slate-800 dark:border-slate-700 shadow-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Approval Rate</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                  {Math.round(stats?.approval_rate || 0)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stats?.approved_count || 0} claims approved</p>
          </div>

          <div className="glass rounded-3xl p-6 border border-white/80 dark:bg-slate-800 dark:border-slate-700 shadow-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 rounded-xl flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">This Month Total</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                  {formatCurrencyTotals(thisMonthExpenses) || 'No claims yet'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{thisMonthExpenses.length} claims filed this month</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass rounded-3xl p-8 shadow-xl border border-white/80 dark:bg-slate-800 dark:border-slate-700 fade-in mb-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
            <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" /> Claims by Category
          </h2>

          {categoryTotals.length > 0 ? (
            <div className="space-y-5">
              {categoryTotals.map((cat) => {
                const percentage = expenses.length > 0 ? Math.round((cat.count / expenses.length) * 100) : 0;
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center text-slate-800 dark:text-slate-100">
                        <span className="text-lg mr-2">{cat.icon}</span> {cat.name} ({cat.count} claims)
                      </span>
                      <span className="text-slate-800 dark:text-slate-100">
                        <span className="text-slate-400 dark:text-slate-400 font-normal">{percentage}% of claims</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-600">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-8">No expense data available for analytics breakdown.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
