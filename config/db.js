const mongoose = require('mongoose');

// This is the function to connect to the database.
async function connectDB(uri) {
  try {
    // This is to connect to MongoDB.
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// This is to like export the function so other files can use it.
module.exports = connectDB;
