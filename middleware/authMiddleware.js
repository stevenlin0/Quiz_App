const jwt = require('jsonwebtoken');

// This is to check if the user is logged in.
module.exports = function requireLogin(req, res, next) {
  try {
    // This is to get the authorization header.
    const header = req.headers.authorization;

    // This is if there is no token, block access.
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // This is to get the actual token part.
    const token = header.split(" ")[1];

    // This is to like verify the token and decode the user info.
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecret");

    // This is to like add the user info to req so the next parts can use it.
    req.user = decoded;

    // This is to like allow the request to continue.
    next();
  } catch (err) {
    // This is token is missing, invalid, or expired.
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
