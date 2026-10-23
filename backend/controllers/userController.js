const User = require('../models/User');
const { normalizeRole, ROLE_DEFAULTS } = require('../utils/roleUtils');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, department, avatar } = req.body;
    if (name) user.name = name;
    if (department) user.department = department;
    if (avatar) user.avatar = avatar;

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      users: users.map((u) => u.toJSON()),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const normalizedRole = normalizeRole(role);
    if (!role || !['user', 'employee', 'manager', 'finance', 'owner'].includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = normalizedRole;
    user.permissions = [...ROLE_DEFAULTS[normalizedRole].permissions];
    user.approvalLimit = ROLE_DEFAULTS[normalizedRole].approvalLimit;
    await user.save();

    return res.status(200).json({
      message: 'User role updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
};
