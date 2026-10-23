const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { normalizeRole, ROLE_DEFAULTS } = require('../utils/roleUtils');

const generateToken = (id, role) =>
  jwt.sign({ id, role: normalizeRole(role) }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      department: department.trim(),
      role: 'employee',
      permissions: ROLE_DEFAULTS.employee.permissions,
      approvalLimit: ROLE_DEFAULTS.employee.approvalLimit,
      avatar: '👤',
    });

    const token = generateToken(user._id, user.role);
    return res.status(201).json({ message: 'Registration successful', token, user: user.toJSON() });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error during registration' });
  }
};

// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);
    return res.status(200).json({ message: 'Login successful', token, user: user.toJSON() });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
};

// @route   POST /api/auth/verify
const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({ valid: true, user: user.toJSON() });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { registerUser, loginUser, verifyToken };
