const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// Signup
exports.signup = async (req, res) => {
  try {
    // This is to like get the data sent by the user.
    const { username, email, password } = req.body;

    // This is to make sure all fields are provided.
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    // This is to check if email or username already exists.
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ error: 'User exists with that email or username' });

    // This is to hash the password.
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // This is to create a new user in the database.
    const user = new User({ username, email, passwordHash });
    await user.save();

    // This is to create a token so that the user stays logged in.
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    // This is to send the token and username back to the frontend.
    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    // This is the user sends either username or email and then password.
    const { emailOrUsername, password } = req.body;

    // This is to make sure the fields were filled in.
    if (!emailOrUsername || !password) return res.status(400).json({ error: 'Missing fields' });

    // This is to find the user by email or username.
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    // This is if no user found, then send error.
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // This is to check if password is correct.
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    // Password is correct, make a token for the user.
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    // This is to send the token and username back to the client.
    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

