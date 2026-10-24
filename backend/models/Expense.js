const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'JPY'],
      default: 'INR',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Travel',
        'Meals',
        'Office Supplies',
        'Software',
        'Marketing',
        'Training',
        'Equipment',
        'Healthcare',
        'Transportation',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedBy: {
      type: String,
      required: true,
    },
    submittedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvalFlow: {
      type: [String],
      default: ['manager', 'finance', 'admin'],
    },
    currentApprover: {
      type: String,
      default: 'manager',
    },
    approvalStage: {
      type: String,
      enum: ['manager', 'finance', 'admin', 'completed'],
      default: 'manager',
    },
    managerApproved: {
      type: Boolean,
      default: false,
    },
    managerApprovedBy: {
      type: String,
      default: null,
    },
    managerApprovedAt: {
      type: String,
      default: null,
    },
    financeApproved: {
      type: Boolean,
      default: false,
    },
    financeApprovedBy: {
      type: String,
      default: null,
    },
    financeApprovedAt: {
      type: String,
      default: null,
    },
    adminApproved: {
      type: Boolean,
      default: false,
    },
    adminApprovedBy: {
      type: String,
      default: null,
    },
    adminApprovedAt: {
      type: String,
      default: null,
    },
    paymentConfirmed: {
      type: Boolean,
      default: false,
    },
    paymentConfirmedBy: {
      type: String,
      default: null,
    },
    paymentConfirmedAt: {
      type: String,
      default: null,
    },
    receipt: {
      type: String,
      default: null,
    },
    submittedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    approvedAt: {
      type: String,
      default: null,
    },
    approvedBy: {
      type: String,
      default: null,
    },
    rejectedAt: {
      type: String,
      default: null,
    },
    rejectedBy: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: null,
    },
    vendor: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Expense', expenseSchema);
