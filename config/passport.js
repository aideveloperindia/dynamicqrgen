const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const connectDB = require('./database');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || (process.env.BASE_URL ? `${process.env.BASE_URL}/auth/google/callback` : 'http://localhost:4000/auth/google/callback')
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Ensure DB connection for serverless
        await connectDB();
        
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        } else {
          // Check if user exists with same email (password-based account)
          const existingUser = await User.findOne({ email: profile.emails[0].value });
          
          if (existingUser) {
            // Link Google account to existing user
            existingUser.googleId = profile.id;
            existingUser.picture = profile.photos[0]?.value || existingUser.picture;
            existingUser.lastLogin = new Date();
            await existingUser.save();
            return done(null, existingUser);
          }

          // Generate unique slug
          const baseSlug = profile.emails[0].value.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          let uniqueSlug = baseSlug;
          let counter = 1;
          
          while (await User.findOne({ uniqueSlug })) {
            uniqueSlug = `${baseSlug}${counter}`;
            counter++;
          }

          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0]?.value,
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

