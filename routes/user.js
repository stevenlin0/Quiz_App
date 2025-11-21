const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const requireLogin = require('../middleware/authMiddleware');
    
router.get('/profile', userController.getProfile);

module.exports = router;
