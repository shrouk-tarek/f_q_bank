const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Forgot password (request reset link)
router.post('/forgot-password', authController.forgotPassword);

// Reset password using token
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;