const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getPendingApprovals,
  approveExpense,
  rejectExpense,
  getApprovalStats,
} = require('../controllers/approvalController');

router.get('/pending', protect, authorize('owner', 'manager', 'finance'), getPendingApprovals);
router.post('/approve/:id', protect, authorize('owner', 'manager', 'finance'), approveExpense);
router.post('/reject/:id', protect, authorize('owner', 'manager', 'finance'), rejectExpense);
router.get('/stats', protect, authorize('owner', 'manager', 'finance'), getApprovalStats);

module.exports = router;
