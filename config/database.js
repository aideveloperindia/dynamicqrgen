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

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dynamicqrgen', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit in serverless environment
    if (process.env.VERCEL) {
      console.error('Running in Vercel - connection will retry on next request');
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;

