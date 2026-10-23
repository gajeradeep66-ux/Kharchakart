const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  uploadReceipt,
} = require('../controllers/expenseController');

router.get('/', protect, getExpenses);
router.post('/', protect, createExpense);
router.get('/stats', protect, getExpenseStats);
router.post('/upload-receipt', protect, upload.single('receipt'), uploadReceipt);
router.get('/:id', protect, getExpenseById);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
