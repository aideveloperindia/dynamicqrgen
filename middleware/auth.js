const connectDB = require('../config/database');

module.exports = async (req, res, next) => {
  try {
    // Ensure DB connection for serverless
    if (process.env.VERCEL) {
      await connectDB();
    }
    
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.redirect('/login');
  }
};

