const connectDB = require('../config/database');

module.exports = async (req, res, next) => {
  try {
    // Ensure DB connection for serverless
    if (process.env.VERCEL) {
      await connectDB();
    }
    
    if (!req.isAuthenticated()) {
      // For API requests (JSON), return 403 JSON response
      if (req.xhr || req.headers['content-type']?.includes('application/json') || req.path.startsWith('/api/')) {
        return res.status(403).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      // For regular page requests, redirect to login
      return res.redirect('/login');
    }
    
    // If user is authenticated, ensure req.user exists
    if (!req.user || !req.user._id) {
      console.error('Auth middleware: req.user is missing or invalid', { user: req.user });
      req.logout((err) => {
        if (err) console.error('Logout error:', err);
      });
      
      if (req.xhr || req.headers['content-type']?.includes('application/json') || req.path.startsWith('/api/')) {
        return res.status(403).json({ 
          success: false, 
          message: 'Invalid session' 
        });
      }
      
      return res.redirect('/login');
    }
    
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    console.error('Error stack:', error.stack);
    
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

