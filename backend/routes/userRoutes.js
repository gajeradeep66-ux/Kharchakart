const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
} = require('../controllers/userController');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/', protect, authorize('owner'), getAllUsers);
router.get('/:id', protect, authorize('owner'), getUserById);
router.put('/:id/role', protect, authorize('owner'), updateUserRole);

module.exports = router;
