const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Expense = require('../models/Expense');

const seedDatabase = async () => {
  try {
    const accounts = [
      {
        name: 'Owner User',
        email: 'owner@kharchakart.com',
        password: 'Owner123!',
        department: 'Administration',
        role: 'owner',
        permissions: ['view_all_expenses', 'manage_users', 'approve_expenses'],
        approvalLimit: 100000,
      },
      {
        name: 'Manager User',
        email: 'manager@kharchakart.com',
        password: 'Manager123!',
        department: 'Operations',
        role: 'manager',
        permissions: ['view_team_expenses', 'approve_expenses'],
        approvalLimit: 25000,
      },
      {
        name: 'Finance User',
        email: 'finance@kharchakart.com',
        password: 'Finance123!',
        department: 'Finance',
        role: 'finance',
        permissions: ['view_all_expenses', 'audit_expenses'],
        approvalLimit: 50000,
      },
      {
        name: 'Employee User',
        email: 'employee@kharchakart.com',
        password: 'Employee123!',
        department: 'Finance',
        role: 'employee',
        permissions: ['submit_expenses', 'view_own_expenses'],
        approvalLimit: 0,
      },
    ];

    for (const account of accounts) {
      const existingUser = await User.findOne({ email: account.email });
      if (existingUser) {
        console.log(`User already exists: ${existingUser.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(account.password, 10);
      const user = await User.create({
        name: account.name,
        email: account.email,
        password: hashedPassword,
        department: account.department,
        role: account.role,
        permissions: account.permissions,
        approvalLimit: account.approvalLimit,
        avatar: '👤',
      });
      console.log(`Created seeded user: ${user.email} (${account.role})`);
    }

    const submitter = await User.findOne({ email: 'employee@kharchakart.com' });

    if (submitter) {
      const existingManager = await Expense.findOne({ currentApprover: 'manager', status: 'pending' });
      const existingFinance = await Expense.findOne({ currentApprover: 'finance', status: 'pending' });
      const existingAdmin = await Expense.findOne({ currentApprover: 'admin', status: 'pending' });

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

      const sampleExpenses = [];

      if (!existingManager) {
        sampleExpenses.push({
          amount: 15000,
          currency: 'INR',
          category: 'Travel',
          description: 'Client meeting travel expense',
          date: now.toISOString().split('T')[0],
          submittedBy: submitter.name,
          submittedById: submitter._id,
          status: 'pending',
          approvalFlow: ['manager', 'finance', 'admin'],
          currentApprover: 'manager',
          approvalStage: 'manager',
          notes: 'This expense is awaiting manager review before finance verification.',
          location: 'Mumbai',
          vendor: 'City Cabs',
          tags: ['travel', 'client'],
        });
      }

      if (!existingFinance) {
        sampleExpenses.push({
          amount: 32000,
          currency: 'INR',
          category: 'Software',
          description: 'Subscription license renewal for finance tools',
          date: yesterday.split('T')[0],
          submittedBy: submitter.name,
          submittedById: submitter._id,
          status: 'pending',
          approvalFlow: ['manager', 'finance', 'admin'],
          currentApprover: 'finance',
          approvalStage: 'finance',
          managerApproved: true,
          managerApprovedBy: 'Manager User',
          managerApprovedAt: twoDaysAgo,
          notes: 'Manager approved. Awaiting finance verification and audit.',
          location: 'Remote',
          vendor: 'QuickBooks',
          tags: ['software', 'finance'],
        });
      }

      if (!existingAdmin) {
        sampleExpenses.push({
          amount: 22000,
          currency: 'INR',
          category: 'Office Supplies',
          description: 'Office furniture purchase pending admin payment confirmation',
          date: twoDaysAgo.split('T')[0],
          submittedBy: submitter.name,
          submittedById: submitter._id,
          status: 'pending',
          approvalFlow: ['manager', 'finance', 'admin'],
          currentApprover: 'admin',
          approvalStage: 'admin',
          managerApproved: true,
          managerApprovedBy: 'Manager User',
          managerApprovedAt: twoDaysAgo,
          financeApproved: true,
          financeApprovedBy: 'Finance User',
          financeApprovedAt: yesterday,
          notes: 'Finance verified. Awaiting final admin payment confirmation.',
          location: 'Bangalore',
          vendor: 'OfficeMart',
          tags: ['office', 'supplies'],
        });
      }

      if (sampleExpenses.length > 0) {
        await Expense.insertMany(sampleExpenses);
        console.log('Seeded missing approval-stage expenses for manager, finance, and admin testing.');
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;
