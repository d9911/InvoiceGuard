import mongoose from 'mongoose'

export const connectDB = async (): Promise<void> => {
  const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-guard'

  mongoose.connection.on('connected', () => console.log('🟢 MongoDB connected successfully'))
  mongoose.connection.on('error', (err) => console.error('🔴 MongoDB connection error:', err))
  mongoose.connection.on('disconnected', () => console.log('🟡 MongoDB disconnected'))

  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    })
  } catch (error) {
    console.error('🔥 Fatal DB Connection error:', error)
    process.exit(1)
  }
}
