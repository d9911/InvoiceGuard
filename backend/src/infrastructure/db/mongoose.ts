import mongoose from 'mongoose';

export const connectDB = async () => {
  const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-guard';
  try {
    await mongoose.connect(url);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('DB Connection error:', error);
    throw error;
  }
};
