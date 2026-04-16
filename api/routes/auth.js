const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  googleLogin,
  getMe,
} = require('../controllers/userController');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', getMe);
router.post('/logout', logout);

module.exports = router;