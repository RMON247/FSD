import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { WebSocketServer } from 'ws'

import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import storageRoutes from './routes/storageRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const app = express()
app.set('trust proxy', 1)

// ---- Security & parsing middleware (Experiment 5) ----
app.use(helmet())
// CORS_ORIGIN unset → allow any origin (reflects the request's actual origin).
// CORS_ORIGIN set → only allow the exact origin(s) listed (comma-separated).
// Note: passing an array like ['*'] to the cors package does NOT wildcard-match —
// it only exact-matches, so '*' must be handled as the special "allow all" case here.
const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true
app.use(cors({ origin: corsOrigin }))
app.use(express.json({ limit: '100kb' }))

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 2, standardHeaders: true, legacyHeaders: false }))
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }))

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }))

// ---- REST API routes (Experiment 4) ----
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/storage', storageRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/transactions', transactionRoutes)

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

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB(process.env.MONGODB_URI)
    } else {
      console.warn('[startup] MONGODB_URI not set — API will start but DB routes will fail until it is configured.')
    }
  } catch (err) {
    console.error('[startup] Failed to connect to MongoDB:', err.message)
    console.warn('[startup] Continuing to start the HTTP/WebSocket server anyway.')
  }

  server.listen(PORT, () => {
    console.log(`[startup] StockYard API + WebSocket server listening on http://localhost:${PORT}`)
  })
}

start()
