import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.send('Lingo MERN backend server is running successfully!');
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lingo';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    app.listen(PORT, () => {
      console.log(`Express Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failure details:', err.message);
    console.log('Attempting to start Server in fallback mode (Express active, MongoDB disconnected for testing)...');
    
    // In developer environment, allow fallback launch so the UI still loads and shows error details if DB is offline.
    app.listen(PORT, () => {
      console.log(`Express Server running in DB-offline fallback mode on port ${PORT}`);
      console.log(`Please ensure MongoDB is running locally at ${MONGODB_URI} or set MONGODB_URI in your environment.`);
    });
  });
