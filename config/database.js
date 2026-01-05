const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected, return
  if (isConnected) {
    return;
  }

  // If connection is in progress, wait for it
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  // Check if MongoDB URI is set
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set. Database operations will fail.');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit in serverless environment - just log and continue
    if (process.env.VERCEL) {
      console.error('Running in Vercel - connection will retry on next request');
      // Reset connection state so it can retry
      isConnected = false;
    } else {
      // Only exit in local development
      console.error('Local development - exiting due to DB connection failure');
      process.exit(1);
    }
    // Throw error so calling code knows connection failed
    throw error;
  }
};

module.exports = connectDB;

