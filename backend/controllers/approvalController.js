const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { normalizeRole } = require('../utils/roleUtils');

const approverStage = {
  manager: 'manager',
  finance: 'finance',
  owner: 'admin',
  admin: 'admin',
};

// @desc    Get pending approvals for current approver role
// @route   GET /api/approvals/pending
// @access  Private (Manager, Admin, Finance)
const getPendingApprovals = async (req, res) => {
  try {
    let query = { status: 'pending' };

    const userRole = normalizeRole(req.user.role);

    if (userRole === 'manager') {
      query.currentApprover = 'manager';
    } else if (userRole === 'finance') {
      query.currentApprover = 'finance';
    } else if (userRole === 'owner' || userRole === 'admin') {
      query.currentApprover = 'admin';
    }

    const expenses = await Expense.find(query).sort({ submittedAt: -1, createdAt: -1 });

    return res.status(200).json({
      expenses: expenses.map((exp) => exp.toJSON()),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Approve an expense (Step 1: Manager -> Step 2: Finance -> Step 3: Admin Payment Confirmation)
// @route   POST /api/approvals/approve/:id
// @access  Private (Manager, Admin, Finance)
const approveExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (expense.status !== 'pending') {
      return res.status(400).json({ error: `Expense is already ${expense.status}` });
    }

    const userRole = normalizeRole(req.user.role);
    if (expense.currentApprover !== approverStage[userRole]) {
      return res.status(400).json({ error: 'This expense is not currently assigned to your review stage.' });
    }

    const nowStr = new Date().toISOString();

    if (userRole === 'manager') {
      // Step 1: Manager Approval
      if (expense.currentApprover !== 'manager') {
        return res.status(400).json({ error: 'This expense is not currently assigned to Manager review.' });
      }
      if (expense.managerApproved) {
        return res.status(400).json({ error: 'Manager has already approved this expense claim.' });
      }

      expense.managerApproved = true;
      expense.managerApprovedBy = req.user.name;
      expense.managerApprovedAt = nowStr;
      expense.currentApprover = 'finance'; // Move to Finance audit stage
      expense.approvalStage = 'finance';

      await expense.save();

      // Notify Finance Team
      const financeUsers = await User.find({ role: 'finance' });
      for (const fUser of financeUsers) {
        await Notification.create({
          title: '📄 Finance Audit Required',
          message: `Manager ${req.user.name} approved ${expense.submittedBy}'s ${expense.category} expense (${expense.currency} ${expense.amount}). Finance verification is required next.`,
          type: 'info',
          timestamp: nowStr,
          read: false,
          actionUrl: '/approvals',
          userId: fUser._id,
        });
      }

      // Notify Submitter
      await Notification.create({
        title: '👍 Step 1 Approved by Manager',
        message: `Your ${expense.category} expense claim of ${expense.currency} ${expense.amount} was approved by Manager ${req.user.name}. Sent to Finance for audit.`,
        type: 'info',
        timestamp: nowStr,
        read: false,
        actionUrl: '/expenses',
        userId: expense.submittedById,
      });

      return res.status(200).json({
        message: 'Step 1 Approved by Manager! Claim sent to Finance for audit.',
        expense: expense.toJSON(),
      });

    } else if (userRole === 'finance') {
      // Step 2: Finance Audit & Verification
      if (expense.currentApprover !== 'finance') {
        return res.status(400).json({ error: 'This expense is not currently assigned to Finance audit.' });
      }
      if (!expense.managerApproved) {
        return res.status(400).json({ error: 'Manager approval is required before Finance audit can proceed.' });
      }

      expense.financeApproved = true;
      expense.financeApprovedBy = req.user.name;
      expense.financeApprovedAt = nowStr;
      expense.currentApprover = 'admin'; // Move to Admin payment confirmation stage
      expense.approvalStage = 'admin';

      await expense.save();

      // Notify owners for final payment confirmation
      const owners = await User.find({ role: { $in: ['owner', 'admin'] } });
      for (const ownerUser of owners) {
        await Notification.create({
          title: '💳 Owner Payment Confirmation Required',
          message: `Finance ${req.user.name} verified ${expense.submittedBy}'s ${expense.category} expense (${expense.currency} ${expense.amount}). Final owner payment confirmation is required.`,
          type: 'warning',
          timestamp: nowStr,
          read: false,
          actionUrl: '/approvals',
          userId: ownerUser._id,
        });
      }

      // Notify Submitter
      await Notification.create({
        title: '💼 Step 2 Verified by Finance',
        message: `Your ${expense.category} expense claim of ${expense.currency} ${expense.amount} was audited & verified by Finance ${req.user.name}. Awaiting Admin payment confirmation.`,
        type: 'info',
        timestamp: nowStr,
        read: false,
        actionUrl: '/expenses',
        userId: expense.submittedById,
      });

      return res.status(200).json({
        message: 'Step 2 Verified by Finance! Claim sent to Admin for final payment confirmation.',
        expense: expense.toJSON(),
      });

    } else if (userRole === 'owner' || userRole === 'admin') {
      // Step 3: Owner Final Approval & Payment Confirmation
      if (expense.currentApprover !== 'admin') {
        return res.status(400).json({ error: 'This expense is not currently assigned to Owner payment confirmation.' });
      }
      if (!expense.managerApproved || !expense.financeApproved) {
        return res.status(400).json({ error: 'This expense must complete Manager and Finance approvals before Owner confirmation.' });
      }

      expense.adminApproved = true;
      expense.adminApprovedBy = req.user.name;
      expense.adminApprovedAt = nowStr;
      expense.approvalStage = 'completed';

      expense.paymentConfirmed = true;
      expense.paymentConfirmedBy = req.user.name;
      expense.paymentConfirmedAt = nowStr;

      expense.status = 'approved';
      expense.approvedAt = nowStr;
      expense.approvedBy = `Manager (${expense.managerApprovedBy || 'Verified'}), Finance (${expense.financeApprovedBy || 'Audited'}) & Owner Payment Confirmed by ${req.user.name}`;
      expense.currentApprover = null;

      await expense.save();

      // Notify Submitter on Payment Confirmation
      await Notification.create({
        title: '💰 Payment Confirmed & Fully Approved',
        message: `Your ${expense.category} expense claim of ${expense.currency} ${expense.amount} has been fully approved & payment confirmed by Admin ${req.user.name}!`,
        type: 'success',
        timestamp: nowStr,
        read: false,
        actionUrl: '/expenses',
        userId: expense.submittedById,
      });

      return res.status(200).json({
        message: 'Expense Payment Confirmed and Fully Approved by Admin!',
        expense: expense.toJSON(),
      });

    } else {
      return res.status(403).json({ error: 'You are not authorized to approve expenses.' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Reject an expense
// @route   POST /api/approvals/reject/:id
// @access  Private (Manager, Admin, Finance)
const rejectExpense = async (req, res) => {
  try {
    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (expense.status !== 'pending') {
      return res.status(400).json({ error: `Expense is already ${expense.status}` });
    }

    const userRole = normalizeRole(req.user.role);
    if (expense.currentApprover !== approverStage[userRole]) {
      return res.status(400).json({ error: 'This expense is not currently assigned to your review stage.' });
    }

    const nowStr = new Date().toISOString();

    expense.status = 'rejected';
    expense.rejectedAt = nowStr;
    expense.rejectedBy = `${req.user.name} (${req.user.role.toUpperCase()})`;
    expense.rejectionReason = reason;
    expense.currentApprover = null;

    await expense.save();

    // Create Notification for Submitter
    await Notification.create({
      title: '❌ Expense Rejected',
      message: `Your ${expense.category} expense claim of ${expense.currency} ${expense.amount} was rejected by ${req.user.role.toUpperCase()} ${req.user.name}: "${reason}"`,
      type: 'error',
      timestamp: nowStr,
      read: false,
      actionUrl: '/expenses',
      userId: expense.submittedById,
    });

    return res.status(200).json({
      message: 'Expense rejected',
      expense: expense.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get approval statistics
// @route   GET /api/approvals/stats
// @access  Private (Manager, Admin, Finance)
const getApprovalStats = async (req, res) => {
  try {
    const expenses = await Expense.find({});

    const totalPending = expenses.filter((e) => e.status === 'pending').length;
    const pendingManager = expenses.filter((e) => e.status === 'pending' && e.currentApprover === 'manager').length;
    const pendingFinance = expenses.filter((e) => e.status === 'pending' && e.currentApprover === 'finance').length;
    const pendingAdmin = expenses.filter((e) => e.status === 'pending' && e.currentApprover === 'admin').length;
    const totalApproved = expenses.filter((e) => e.status === 'approved').length;
    const totalRejected = expenses.filter((e) => e.status === 'rejected').length;

    return res.status(200).json({
      total_pending: totalPending,
      pending_manager: pendingManager,
      pending_finance: pendingFinance,
      pending_admin: pendingAdmin,
      total_approved: totalApproved,
      total_rejected: totalRejected,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPendingApprovals,
  approveExpense,
  rejectExpense,
  getApprovalStats,
};
