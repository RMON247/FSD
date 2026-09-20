import mongoose from 'mongoose'

export async function connectDB(uri) {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  console.log(`[db] connected to MongoDB → ${mongoose.connection.name}`)

  mongoose.connection.on('error', (err) => console.error('[db] connection error:', err.message))
  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected'))
}
