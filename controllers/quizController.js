const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

const dataPath = path.join(__dirname, '..', 'data', 'questions.json');

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Start quiz
exports.startQuiz = async (req, res) => {
  try {
    // This is the where questions come from.
    const source = req.query.source || 'local';

    // This is the number of questions the user wants.
    const amount = Math.min(50, parseInt(req.query.amount) || 10);

    // OpenTDB API for questions.
    if (source === 'opentdb') {
      const category = req.query.category || '';
      let apiUrl = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;

      // This is the category filter.
      if (category) apiUrl += `&category=${category}`;

      // This is to fetch questions from OpenTDB.
      const r = await fetch(apiUrl);
      const json = await r.json();

      // This is to like format the returned questions.
      const questions = (json.results || []).map((q, idx) => {
        // This is to mix correct and incorrect answers together.
        const choices = shuffle([...q.incorrect_answers, q.correct_answer]);
        return {
          id: `${Date.now()}_${idx}`,
          question: q.question,
          choices,
          correctAnswer: q.correct_answer
        };
      });

      return res.json({ questions });
    }

    // Local questions
    const raw = fs.readFileSync(dataPath, 'utf8');
    const pool = JSON.parse(raw);

    // This is to randomly select and format questions.
    const selected = shuffle(pool)
        .slice(0, amount)
        .map((q, idx) => {
          const choices = shuffle([q.A, q.B, q.C, q.D]);
          const correctAnswer = q[q.answer];

          return {
            id: `${Date.now()}_${idx}`,
            question: q.question,
            choices,
            correctAnswer
          };
        });

    res.json({ questions: selected });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start quiz' });
  }
};

// Submit quiz
exports.submitQuiz = async (req, res) => {
  try {
    // This is to send score info after finishing the quiz.
    const { score, totalQuestions, questionsUsed } = req.body;
    let userId = null;

    // This is to like read JWT token from headers.
    const authHeader = req.headers.authorization;
    const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      // This is to try to decode the token to get user ID.
      try {
        const payload = require('jsonwebtoken').verify(token, JWT_SECRET);
        userId = payload.id;
      } catch (e) {}
    }

    // This is if user is logged in, then save score to their account.
    if (userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      // This is to add quiz score to the user's history.
      user.scores.push({ score, totalQuestions, questionsUsed });
      await user.save();

      return res.json({ ok: true, saved: true });
    }

    // This is if the user is not logged in, quiz still works, but not saved.
    return res.json({ ok: true, saved: false });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Submission failed' });
  }
};

