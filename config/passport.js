const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const connectDB = require('./database');

// Validate Google OAuth credentials
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  WARNING: Google OAuth credentials not configured. Gmail login will not work.');
  console.warn('   Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables.');
} else {
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
    (process.env.BASE_URL ? `${process.env.BASE_URL}/auth/google/callback` : 'http://localhost:4000/auth/google/callback');

  console.log('🔐 Google OAuth configured:', {
    hasClientID: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
  });

  try {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: callbackURL
        },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Validate profile data
        if (!profile || !profile.id) {
          return done(new Error('Invalid Google profile: missing ID'), null);
        }

        // Check for email (required)
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          console.error('Google profile missing email:', profile);
          return done(new Error('Google account email not available. Please ensure your Google account has an email address.'), null);
        }

        const email = profile.emails[0].value.toLowerCase().trim();
        const displayName = profile.displayName || profile.name?.givenName || email.split('@')[0] || 'User';
        
        // Ensure DB connection for serverless
        await connectDB();
        
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update last login and profile info
          user.lastLogin = new Date();
          if (profile.photos && profile.photos[0]?.value) {
            user.picture = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        } else {
          // Check if user exists with same email (password-based account)
          const existingUser = await User.findOne({ email });
          
          if (existingUser) {
            // Link Google account to existing user
            existingUser.googleId = profile.id;
            if (profile.photos && profile.photos[0]?.value) {
              existingUser.picture = profile.photos[0].value;
            }
            existingUser.lastLogin = new Date();
            await existingUser.save();
            return done(null, existingUser);
          }

          // Generate unique slug from email
          const baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          
          if (!baseSlug || baseSlug.length === 0) {
            return done(new Error('Unable to generate unique identifier from email'), null);
          }

          let uniqueSlug = baseSlug;
          let counter = 1;
          
          while (await User.findOne({ uniqueSlug })) {
            uniqueSlug = `${baseSlug}${counter}`;
            counter++;
            // Prevent infinite loop
            if (counter > 1000) {
              return done(new Error('Unable to generate unique identifier. Please try again.'), null);
            }
          }

          user = new User({
            googleId: profile.id,
            email: email,
            name: displayName,
            picture: profile.photos?.[0]?.value || '',
            uniqueSlug: uniqueSlug,
            lastLogin: new Date()
          });

          await user.save();
          return done(null, user);
        }
      } catch (error) {
        console.error('Google Strategy error:', error);
        return done(error, null);
      }
    }
      )
    );
  } catch (error) {
    console.error('❌ Failed to initialize Google OAuth Strategy:', error);
    console.error('   Google OAuth will not work until credentials are fixed.');
  }
}

passport.serializeUser((user, done) => {
  // Store user ID as string
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    // Ensure DB connection for serverless
    await connectDB();
    
    // Try User first
    let user = await User.findById(id);
    if (user) {
      return done(null, user);
    }
    
    // Try Admin if not found in User
    const Admin = require('../models/Admin');
    const admin = await Admin.findById(id);
    if (admin) {
      return done(null, admin);
    }
    
    console.log('User/Admin not found in deserializeUser:', id);
    return done(null, false);
  } catch (error) {
    console.error('Deserialize error:', error);
    done(error, null);
  }
});

module.exports = passport;

