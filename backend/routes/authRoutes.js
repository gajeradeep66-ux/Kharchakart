const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyToken,
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyToken);

module.exports = router;
