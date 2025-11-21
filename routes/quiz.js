const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const requireLogin = require('../middleware/authMiddleware');

router.get('/start', requireLogin, quizController.startQuiz);
router.post('/submit', requireLogin, quizController.submitQuiz);

module.exports = router;
