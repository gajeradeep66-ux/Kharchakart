import React from 'react';
import { formatCurrency, getCategoryIcon, formatTimeAgo } from '../utils/formatters';
import { normalizeRole, isEmployeeRole } from '../utils/roleUtils';
import { X, MapPin, Store, Paperclip, StickyNote, Tags, Calendar, User, Check, X as RejectIcon, Edit2 } from 'lucide-react';

const approverStage = {
  manager: 'manager',
  finance: 'finance',
  owner: 'admin',
  admin: 'admin',
};

const ExpenseDetailModal = ({ expense, onClose, onApprove, onReject, onEdit, currentUser }) => {
  if (!expense) return null;

  const normalizedRole = normalizeRole(currentUser?.role);
  const targetStage = approverStage[normalizedRole];
  const isAssignedToMe = expense.status === 'pending' && Boolean(targetStage) && expense.currentApprover === targetStage;
  const canApprove = Boolean(onApprove) && isAssignedToMe;
  const canReject = Boolean(onReject) && isAssignedToMe;

  const submittedId = expense.submittedById?._id || expense.submittedById?.id || expense.submittedById;
  const isOwnerOfExpense = currentUser && (
    String(currentUser.id) === String(submittedId) ||
    String(currentUser._id) === String(submittedId)
  );

  const approveButtonText = (normalizedRole === 'owner' || normalizedRole === 'admin')
    ? 'Confirm Payment & Final Approve'
    : normalizedRole === 'finance'
    ? 'Approve Finance Audit'
    : normalizedRole === 'manager'
    ? 'Approve Manager Review'
    : 'Approve';

  const receiptUrl = expense.receipt
    ? (expense.receipt.startsWith('http://') || expense.receipt.startsWith('https://') || expense.receipt.startsWith('/')
        ? expense.receipt
        : `/uploads/${expense.receipt}`)
    : null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/80 p-6 shadow-2xl custom-scrollbar dark:border-slate-700 dark:bg-slate-900 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex min-w-0 items-center space-x-3">
            <span className="shrink-0 rounded-2xl border border-blue-100 bg-blue-50 p-2 text-3xl shadow-sm dark:border-slate-600 dark:bg-slate-700">
              {getCategoryIcon(expense.category)}
            </span>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Expense Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">ID: #{expense.id.substring(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            aria-label="Close expense details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expense Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-slate-700 dark:to-slate-700 p-4 rounded-2xl border border-blue-100 dark:border-slate-600">
            <p className="mb-1 text-xs font-semibold text-blue-700 dark:text-blue-300">Description</p>
            <p className="break-words text-sm font-bold text-slate-800 dark:text-slate-100">{expense.description}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-slate-700 dark:to-slate-700 p-4 rounded-2xl border border-emerald-100 dark:border-slate-600">
            <p className="mb-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Amount</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mt-0.5">{expense.currency || 'INR'} (original currency)</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50/80 to-fuchsia-50/80 dark:from-slate-700 dark:to-slate-700 p-4 rounded-2xl border border-purple-100 dark:border-slate-600">
            <p className="mb-1 flex items-center text-xs font-semibold text-purple-700 dark:text-purple-300">
              <Calendar className="w-3.5 h-3.5 mr-1" /> Date
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {new Date(expense.date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-slate-700 dark:to-slate-700 p-4 rounded-2xl border border-amber-100 dark:border-slate-600">
            <p className="mb-1 flex items-center text-xs font-semibold text-amber-700 dark:text-amber-300">
              <User className="w-3.5 h-3.5 mr-1" /> Submitted By
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{expense.submittedBy}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{formatTimeAgo(expense.submittedAt)}</p>
          </div>
        </div>

        {/* 3-Step Role Workflow Pipeline Status */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Approval & Payment Pipeline (Manager ➔ Finance ➔ Admin Payment Confirm)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className={`rounded-xl border p-3 ${expense.managerApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200' : 'bg-amber-50 border-amber-200 text-amber-800 font-bold animate-pulse dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'}`}>
              <div className="flex items-center font-bold mb-0.5">
                {expense.managerApproved ? '✓ Step 1: Manager Review' : '⏳ Step 1: Manager Review'}
              </div>
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                {expense.managerApprovedBy ? `Approved by ${expense.managerApprovedBy}` : 'Awaiting Manager review'}
              </p>
            </div>

            <div className={`rounded-xl border p-3 ${expense.financeApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200' : expense.managerApproved ? 'bg-purple-50 border-purple-200 text-purple-800 font-bold animate-pulse dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-200' : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'}`}>
              <div className="flex items-center font-bold mb-0.5">
                {expense.financeApproved ? '✓ Step 2: Finance Audit' : expense.managerApproved ? '⏳ Step 2: Finance Audit' : '🔒 Step 2: Finance Pending'}
              </div>
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                {expense.financeApprovedBy ? `Audited by ${expense.financeApprovedBy}` : expense.managerApproved ? 'Pending Finance audit' : 'Requires Manager approval first'}
              </p>
            </div>

            <div className={`rounded-xl border p-3 ${expense.paymentConfirmed || expense.adminApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200' : expense.financeApproved ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold animate-pulse dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200' : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'}`}>
              <div className="flex items-center font-bold mb-0.5">
                {expense.paymentConfirmed || expense.adminApproved ? '💳 Step 3: Paid & Confirmed' : expense.financeApproved ? '⏳ Step 3: Admin Payment' : '🔒 Step 3: Admin Locked'}
              </div>
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                {expense.adminApprovedBy ? `Confirmed by ${expense.adminApprovedBy}` : expense.financeApproved ? 'Pending Admin Payment Confirm' : 'Requires Finance approval first'}
              </p>
            </div>
          </div>
        </div>

        {/* Rejection Reason if any */}
        {expense.status === 'rejected' && expense.rejectionReason && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
            <p className="mb-1 text-xs font-bold text-rose-700 dark:text-rose-300">Rejection Reason:</p>
            <p className="break-words text-xs text-rose-800 dark:text-rose-200">{expense.rejectionReason}</p>
          </div>
        )}

        {/* Extra details */}
        <div className="space-y-3 mb-6">
          {expense.location && (
            <div className="flex min-w-0 items-center break-words rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <MapPin className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
              <span className="font-semibold mr-2">Location:</span> {expense.location}
            </div>
          )}

          {expense.vendor && (
            <div className="flex min-w-0 items-center break-words rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Store className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
              <span className="font-semibold mr-2">Vendor:</span> {expense.vendor}
            </div>
          )}

          {receiptUrl && (
            <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs dark:border-blue-900 dark:bg-blue-950/30">
              <div className="flex shrink-0 items-center font-semibold text-blue-700 dark:text-blue-300">
                <Paperclip className="w-4 h-4 mr-2" /> Receipt File
              </div>
              <a
                href={receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="max-w-[70%] break-all rounded-lg border border-blue-200 bg-white px-3 py-1 text-right text-xs font-bold text-blue-700 hover:underline dark:border-blue-800 dark:bg-slate-800 dark:text-blue-300"
                title={receiptUrl}
              >
                View Attachment ({receiptUrl.split('/').pop()})
              </a>
            </div>
          )}

          {expense.notes && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5 text-xs dark:border-amber-900 dark:bg-amber-950/30">
              <div className="mb-1 flex items-center font-bold text-amber-700 dark:text-amber-300">
                <StickyNote className="w-3.5 h-3.5 mr-1.5" /> Notes
              </div>
              <p className="break-words leading-relaxed text-slate-700 dark:text-slate-200">{expense.notes}</p>
            </div>
          )}

          {expense.tags && expense.tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-1.5 pt-2">
              <Tags className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {expense.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 sm:gap-3">
          {expense.status === 'pending' && !isEmployeeRole(currentUser?.role) && !isAssignedToMe && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              Current Stage: <strong className="capitalize">{expense.currentApprover || expense.approvalStage}</strong> review
            </span>
          )}

          {canReject && (
            <button
              onClick={() => onReject && onReject(expense.id)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center shadow-md hover:shadow-rose-200"
            >
              <RejectIcon className="w-4 h-4 mr-1.5" /> Reject
            </button>
          )}

          {canApprove && (
            <button
              onClick={() => onApprove && onApprove(expense.id)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center shadow-md hover:shadow-emerald-200"
            >
              <Check className="w-4 h-4 mr-1.5" /> {approveButtonText}
            </button>
          )}

          {expense.status === 'pending' && isOwnerOfExpense && (
            <button
              onClick={() => onEdit && onEdit(expense)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center shadow-md hover:shadow-blue-200"
            >
              <Edit2 className="w-4 h-4 mr-1.5" /> Edit
            </button>
          )}

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailModal;
