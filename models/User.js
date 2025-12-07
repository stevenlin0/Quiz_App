const mongoose = require('mongoose');

// One quiz score.
const ScoreSchema = new mongoose.Schema({
  quizDate: { type: Date, default: Date.now },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  questionsUsed: { type: Array, default: [] }
});

// This is just like how a user is stored in the database.
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email:    { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  scores: [ScoreSchema]
});

// This is to let other files use this model.
module.exports = mongoose.model('User', UserSchema);
