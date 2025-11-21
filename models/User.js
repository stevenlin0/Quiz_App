const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  quizDate: { type: Date, default: Date.now },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  questionsUsed: { type: Array, default: [] }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email:    { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  scores: [ScoreSchema]
});

module.exports = mongoose.model('User', UserSchema);
