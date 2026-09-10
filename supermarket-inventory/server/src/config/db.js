import mongoose from 'mongoose'

export async function connectDB(uri) {
  mongoose.set('strictQuery', true)
  const maskedUri = uri ? uri.replace(/\/\/(.*):(.*)@/, '//***:***@') : 'undefined'
  console.log(`[db] Attempting connection to MongoDB (${maskedUri})...`)
  
  await mongoose.connect(uri)
  console.log(`[db] Successfully connected to MongoDB → database: "${mongoose.connection.name}"`)

  mongoose.connection.on('error', (err) => console.error('[db] connection error:', err.message))
  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected from MongoDB'))
}

