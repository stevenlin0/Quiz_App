const jwt = require('jsonwebtoken');
const User = require('../../Quiz_App/models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// This is to get the logged-in user's profile.
exports.getProfile = async (req, res) => {
  try {
    // This is to like get the authorization header from the request.
    const authHeader = req.headers.authorization;

    // This is if there is like no token, block access.
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

    // This is to get the actual token part.
    const token = authHeader.split(' ')[1];

    // This is to like verify the token and decode the user info.
    const payload = jwt.verify(token, JWT_SECRET);

    // This is to look up the user in the database.
    const user = await User.findById(payload.id).select('-passwordHash -__v');

    // This is if no user found, return error.
    if (!user) return res.status(404).json({ error: 'User not found' });

    // This is to send the user profile back to the client.
    res.json({ user });
  } catch (err) {
    console.error(err);
    // This is if token is invalid or expired, user is unauthorized.
    res.status(401).json({ error: 'Unauthorized' });
  }
};
