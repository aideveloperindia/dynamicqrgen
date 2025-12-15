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
          return done(null, user);
        } else {
          // Generate unique slug
          const baseSlug = profile.emails[0].value.split('@')[0].toLowerCase();
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
            uniqueSlug: uniqueSlug
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
    
    const user = await User.findById(id);
    if (!user) {
      console.log('User not found in deserializeUser:', id);
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    console.error('Deserialize error:', error);
    done(error, null);
  }
});

module.exports = passport;

