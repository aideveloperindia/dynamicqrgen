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
    
    // For API requests (JSON), return 403 JSON response
    if (req.xhr || req.headers['content-type']?.includes('application/json') || req.path.startsWith('/api/')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // For regular page requests, redirect to login
    res.redirect('/login');
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // For API requests, return JSON error
    if (req.xhr || req.headers['content-type']?.includes('application/json') || req.path.startsWith('/api/')) {
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error' 
      });
    }
    
    res.redirect('/login');
  }
};

