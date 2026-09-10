import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { WebSocketServer } from 'ws'
import mongoose from 'mongoose'

import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const app = express()

// ---- Security & parsing middleware (Experiment 5) ----
app.use(helmet())
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }))
app.use(express.json({ limit: '100kb' }))

// Rate-limit all API routes to blunt brute-force / abuse
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }))

// Stricter limiter on auth endpoints specifically (login/register brute force)
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }))

// Root & Health endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'StockYard Inventory REST & WebSocket API',
    status: 'online',
    dbConnected: mongoose.connection.readyState === 1,
    health: '/health'
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    dbConnected: mongoose.connection.readyState === 1
  })
})

// ---- REST API routes (Experiment 4) ----
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

// ---- HTTP + WebSocket server on the same port (Experiment 8) ----
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

function broadcast(message) {
  const data = JSON.stringify(message)
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(data)
  })
}
app.locals.broadcast = broadcast

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'connection:ack', payload: { message: 'Connected to StockYard live feed' } }))
  socket.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString())
      if (msg.type === 'ping') socket.send(JSON.stringify({ type: 'pong', payload: { at: Date.now() } }))
    } catch {
      // ignore malformed client messages
    }
  })
})

const PORT = process.env.PORT || 4000
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL

async function start() {
  try {
    if (mongoUri) {
      await connectDB(mongoUri)
    } else {
      console.warn('[startup] MONGODB_URI/MONGO_URI environment variable is not set. API is running but DB routes will fail.')
    }
  } catch (err) {
    console.error('[startup] Failed to connect to MongoDB Atlas:', err.message)
    console.warn('[startup] Server is running, but database operations will fail until MongoDB connection is established.')
  }

  server.listen(PORT, () => {
    console.log(`[startup] StockYard API + WebSocket server listening on port ${PORT}`)
  })
}

start()

