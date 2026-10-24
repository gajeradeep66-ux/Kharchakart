const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { normalizeRole } = require('../utils/roleUtils');

// @desc    Get all expenses (with filters & user isolation)
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { status, category, date_range, search } = req.query;

    let query = {};

    // Role-based restrictions
    if (['user', 'employee'].includes(normalizeRole(req.user.role))) {
      query.submittedById = req.user._id;
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    let expenses = await Expense.find(query).sort({ submittedAt: -1, createdAt: -1 });

    // Apply text search in memory if requested
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      expenses = expenses.filter(
        (exp) =>
          exp.description.toLowerCase().includes(searchLower) ||
          exp.category.toLowerCase().includes(searchLower) ||
          exp.submittedBy.toLowerCase().includes(searchLower) ||
          (exp.vendor && exp.vendor.toLowerCase().includes(searchLower)) ||
          (exp.location && exp.location.toLowerCase().includes(searchLower))
      );
    }

    // Apply date range filter
    if (date_range && date_range !== 'all') {
      const now = new Date();
      expenses = expenses.filter((exp) => {
        const expenseDate = new Date(exp.date);
        if (Number.isNaN(expenseDate.getTime())) return false;
        if (date_range === 'today') {
          return expenseDate.toDateString() === now.toDateString();
        } else if (date_range === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return expenseDate >= weekAgo;
        } else if (date_range === 'month') {
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        } else if (date_range === 'quarter') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const expQuarter = Math.floor(expenseDate.getMonth() / 3);
          return (
            expQuarter === currentQuarter &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        }
        return true;
      });
    }

    return res.status(200).json({
      expenses: expenses.map((exp) => exp.toJSON()),
    });
  } catch (error) {
    console.error('getExpenses error:', error);
    return res.status(500).json({ error: error.message || 'Error fetching expenses' });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const {
      amount,
      currency,
      category,
      description,
      date,
      location,
      vendor,
      notes,
      tags,
      receipt,
    } = req.body;

    if (!amount || !currency || !category || !description || !date) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const approvalFlow = ['manager', 'finance', 'admin'];
    const currentApprover = 'manager';
    const approvalStage = 'manager';

    const expense = await Expense.create({
      amount: parseFloat(amount),
      currency,
      category,
      description,
      date,
      status: 'pending',
      submittedBy: req.user.name,
      submittedById: req.user._id,
      approvalFlow,
      currentApprover,
      approvalStage,
      receipt: receipt || null,
      submittedAt: new Date().toISOString(),
      location: location || null,
      vendor: vendor || null,
      notes: notes || null,
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map((t) => t.trim()) : [],
    });

    try {
      const managers = await User.find({ role: { $in: ['manager', 'owner', 'admin'] } }).select('_id');
      const timestamp = new Date().toISOString();
      if (managers.length > 0) {
        await Notification.insertMany(managers.map((manager) => ({
          title: 'New Expense Submitted',
          message: `${req.user.name} submitted a ${category.toLowerCase()} expense for ${currency} ${amount}`,
          type: 'info',
          timestamp,
          read: false,
          actionUrl: '/approvals',
          userId: manager._id,
        })));
      }
    } catch (notifErr) {
      console.warn('Failed to send manager submission notification:', notifErr.message);
    }

    return res.status(201).json({
      message: 'Expense created successfully',
      expense: expense.toJSON(),
    });
  } catch (error) {
    console.error('createExpense error:', error);
    return res.status(500).json({ error: error.message || 'Error creating expense' });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (['user', 'employee'].includes(normalizeRole(req.user.role)) && expense.submittedById.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.status(200).json({ expense: expense.toJSON() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Update pending expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (['user', 'employee'].includes(normalizeRole(req.user.role)) && expense.submittedById.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (expense.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot edit approved or rejected expenses' });
    }

    const fields = [
      'amount',
      'currency',
      'category',
      'description',
      'date',
      'notes',
      'tags',
      'location',
      'vendor',
      'receipt',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        expense[field] = req.body[field];
      }
    });

    await expense.save();

    return res.status(200).json({
      message: 'Expense updated successfully',
      expense: expense.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Delete pending expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (['user', 'employee'].includes(normalizeRole(req.user.role)) && expense.submittedById.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (expense.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot delete approved or rejected expenses' });
    }

    await expense.deleteOne();

    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get expense summary statistics
// @route   GET /api/expenses/stats
// @access  Private
const getExpenseStats = async (req, res) => {
  try {
    let query = {};
    if (['user', 'employee'].includes(normalizeRole(req.user.role))) {
      query.submittedById = req.user._id;
    }

    const expenses = await Expense.find(query);

    const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const approvedCount = expenses.filter((e) => e.status === 'approved').length;
    const pendingCount = expenses.filter((e) => e.status === 'pending').length;
    const rejectedCount = expenses.filter((e) => e.status === 'rejected').length;

    const now = new Date();
    const thisMonthExpenses = expenses.filter((e) => {
      const date = new Date(e.date);
      return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const thisMonthAmount = thisMonthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    return res.status(200).json({
      total_expenses: expenses.length,
      total_amount: totalAmount,
      approved_count: approvedCount,
      pending_count: pendingCount,
      rejected_count: rejectedCount,
      this_month_expenses: thisMonthExpenses.length,
      this_month_amount: thisMonthAmount,
      approval_rate: expenses.length > 0 ? (approvedCount / expenses.length) * 100 : 0,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Upload expense receipt file
// @route   POST /api/expenses/upload-receipt
// @access  Private
const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a receipt file' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(200).json({
      message: 'Receipt uploaded successfully',
      filename: req.file.filename,
      url: fileUrl,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  uploadReceipt,
};
