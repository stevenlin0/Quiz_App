const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireLogin = require('../middleware/authMiddleware');

// GET /api/leaderboard
router.get('/', requireLogin, async (req, res) => {
  try {
    // Compute highest score per user and return top 10
    const users = await User.find({}).select('username scores').lean();
    const leaderboard = users.map(u => {
      const best = u.scores.reduce((acc, s) => {
        if (!acc || s.score > acc.score) return { score: s.score, totalQuestions: s.totalQuestions, date: s.quizDate };
        return acc;
      }, null);
      return { username: u.username, bestScore: best ? best.score : 0, totalQuestions: best ? best.totalQuestions : 0 };
    }).sort((a,b) => b.bestScore - a.bestScore).slice(0, 10);
    res.json({ leaderboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch leaderboard' });
  }
});

module.exports = router;
