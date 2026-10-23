const mongoose = require('mongoose');

const RETRY_DELAY_MS = 10000;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kharchakart';

  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI is not set — falling back to the local MongoDB URI.');
  }

  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB error:', err.message);
      });

      return conn;
    } catch (error) {
      console.error(
        `❌ MongoDB Connection Error (attempt ${attempt}): ${error.message}`
      );

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

module.exports = connectDB;
