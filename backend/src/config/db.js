const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

// Configure public DNS servers to resolve MongoDB SRV records reliably
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  console.warn('Could not set custom DNS servers:', err.message);
}

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn(`Primary MongoDB connection failed: ${error.message}`);
    // If not already trying localhost, try connecting to local MongoDB server
    if (!env.mongoUri.includes('127.0.0.1') && !env.mongoUri.includes('localhost')) {
      console.log('Attempting connection to local MongoDB fallback (mongodb://127.0.0.1:27017/outfit-app)...');
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/outfit-app', { serverSelectionTimeoutMS: 3000 });
        console.log('MongoDB connected successfully to local instance');
        return;
      } catch (localErr) {
        console.error('Local MongoDB connection also failed:', localErr.message);
      }
    }

    console.error('MongoDB connection failed');
    process.exit(1);
  }
};

module.exports = connectDB;