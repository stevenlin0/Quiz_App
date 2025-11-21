const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args)); // dynamic import for node >=18

const dataPath = path.join(__dirname, '..', 'data', 'questions.json');

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// GET /api/quiz/start?source=local&amount=10
exports.startQuiz = async (req, res) => {
  try {
    const source = req.query.source || 'local'; 
    const amount = Math.min(50, parseInt(req.query.amount) || 10);

    // ---------- OpenTDB Mode (Later Phase) ----------
    if (source === 'opentdb') {
      const category = req.query.category || '';
      let apiUrl = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
      if (category) apiUrl += `&category=${category}`;

      const r = await fetch(apiUrl);
      const json = await r.json();

      const questions = (json.results || []).map((q, idx) => {
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

    // ---------- Local Questions Mode (Your JSON format) ----------
    const raw = fs.readFileSync(dataPath, 'utf8');
    const pool = JSON.parse(raw);

    const selected = shuffle(pool)
      .slice(0, amount)
      .map((q, idx) => {
        // Convert A/B/C/D into array of answer texts
        const choices = shuffle([q.A, q.B, q.C, q.D]);

        // Correct answer in local JSON is letter (A/B/C/D)
        const correctAnswer = q[q.answer]; // q["A"] → "stop"

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

// POST /api/quiz/submit
exports.submitQuiz = async (req, res) => {
  try {
    const { score, totalQuestions, questionsUsed } = req.body;
    let userId = null;

    const authHeader = req.headers.authorization;
    const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = require('jsonwebtoken').verify(token, JWT_SECRET);
        userId = payload.id;
      } catch (e) {
        // invalid token - treat as guest
      }
    }

    if (userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      user.scores.push({ score, totalQuestions, questionsUsed });
      await user.save();

      return res.json({ ok: true, saved: true });
    }

    return res.json({ ok: true, saved: false });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Submission failed' });
  }
};
