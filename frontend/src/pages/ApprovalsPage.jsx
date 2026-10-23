import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import ExpenseDetailModal from '../components/ExpenseDetailModal';
import RejectModal from '../components/RejectModal';
import { useAuth } from '../context/AuthContext';
import { approvalService } from '../services/api';
import { formatCurrency, getCategoryIcon, formatTimeAgo } from '../utils/formatters';
import { normalizeRole } from '../utils/roleUtils';
import { CheckSquare, Check, X as RejectIcon, Eye, CheckCircle2 } from 'lucide-react';

const ApprovalsPage = () => {
  const { user, showToast } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await approvalService.getPendingApprovals();
      setPendingApprovals(res.expenses || []);
    } catch (err) {
      console.error('Error fetching approvals:', err);
      showToast(err.response?.data?.error || err.message || 'Unable to load pending approvals.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const getApproveLabel = () => {
    const normalizedRole = normalizeRole(user?.role);
    if (normalizedRole === 'owner') return 'Confirm Payment & Final Approve';
    if (normalizedRole === 'finance') return 'Approve Finance Audit';
    if (normalizedRole === 'manager') return 'Approve Manager Review';
    return 'Approve';
  };

  const handleApprove = async (id) => {
    try {
      await approvalService.approveExpense(id);
      showToast('Expense approved successfully!', 'success');
      setSelectedExpense(null);
      fetchApprovals();
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Failed to approve', 'error');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await approvalService.rejectExpense(id, reason);
      showToast('Expense rejected', 'info');
      setSelectedExpense(null);
      setRejectTarget(null);
      fetchApprovals();
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Failed to reject', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 fade-in">
            <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center">
                <CheckSquare className="w-8 h-8 text-blue-600 mr-3" /> Pending Approvals Queue
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Review, verify, and approve expense claims submitted by employees
              </p>
            </div>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-2xl text-xs font-bold border border-blue-200 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-700">
              Role: <span className="uppercase">{user?.role}</span>
            </span>
          </div>
        </div>

        {/* Approvals List */}
        {loading ? (
          <div className="glass rounded-3xl p-12 text-center text-slate-600 dark:text-slate-300" role="status">
            Loading pending approvals…
          </div>
        ) : pendingApprovals.length > 0 ? (
          <div className="space-y-6 fade-in">
            {pendingApprovals.map((expense) => (
              <div
                key={expense.id}
                className="glass rounded-3xl p-6 sm:p-8 shadow-xl border border-white/80 dark:bg-slate-800 dark:border-slate-700 hover:shadow-2xl transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Category & Details */}
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center text-3xl shadow-md border border-white flex-shrink-0 dark:bg-slate-700 dark:border-slate-700">
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{expense.description}</h3>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        Submitted by <span className="text-blue-600 font-bold">{expense.submittedBy}</span> •{' '}
                        {formatTimeAgo(expense.submittedAt)}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600 font-medium">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                          Category: <strong>{expense.category}</strong>
                        </span>
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                          Date: <strong>{new Date(expense.date).toLocaleDateString()}</strong>
                        </span>
                        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2 my-3">
                          <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                            expense.managerApproved
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                          }`}>
                            {expense.managerApproved ? '✓ Step 1: Manager Review Complete' : '⏳ Step 1: Manager Review'}
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                            expense.financeApproved
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : expense.managerApproved
                              ? 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {expense.financeApproved ? '✓ Step 2: Finance Verification Complete' : expense.managerApproved ? '⏳ Step 2: Finance Verification' : '🔒 Step 2: Finance Pending'}
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                            expense.paymentConfirmed || expense.adminApproved
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : expense.financeApproved
                              ? 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {expense.paymentConfirmed || expense.adminApproved
                              ? '✓ Step 3: Admin Payment Confirmed'
                              : expense.financeApproved
                              ? '⏳ Step 3: Admin Payment Confirmation'
                              : '🔒 Step 3: Admin Pending'}
                          </div>
                        </div>
                        {expense.location && (
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            Location: <strong>{expense.location}</strong>
                          </span>
                        )}
                        {expense.vendor && (
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            Vendor: <strong>{expense.vendor}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount & Quick Actions */}
                  <div className="flex flex-col items-start lg:items-end justify-between space-y-4">
                    <div className="lg:text-right">
                      <p className="text-3xl font-black text-slate-800 dark:text-slate-100">
                        {formatCurrency(expense.amount, expense.currency)}
                      </p>
                      <p className="text-xs font-bold text-slate-400">{expense.currency || 'INR'} (original currency)</p>
                    </div>

                      <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setSelectedExpense(expense)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
                      >
                        <Eye className="w-4 h-4 mr-1.5" /> Details
                      </button>
                      <button
                        onClick={() => setRejectTarget(expense)}
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center"
                      >
                        <RejectIcon className="w-4 h-4 mr-1.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(expense.id)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center whitespace-normal leading-snug"
                      >
                        <Check className="w-4 h-4 mr-1.5" /> {getApproveLabel()}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes box */}
                {expense.notes && (
                  <div className="mt-4 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs text-amber-900">
                    <strong>Submitter Notes:</strong> {expense.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl p-16 text-center shadow-xl border border-white/80 dark:bg-slate-800 dark:border-slate-700 fade-in">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">All Caught Up!</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              There are no pending expense approval claims awaiting your review at this time.
            </p>
          </div>
        )}
      </main>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          currentUser={user}
          onClose={() => setSelectedExpense(null)}
          onApprove={handleApprove}
          onReject={(id) => {
            const exp = pendingApprovals.find((e) => e.id === id);
            setSelectedExpense(null);
            setRejectTarget(exp || { id });
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

export default ApprovalsPage;
