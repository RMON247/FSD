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
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

// ---- Security & parsing middleware ----
app.use(helmet())

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins === true || allowedOrigins.includes('*')) return callback(null, true)
    if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) return callback(null, true)
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true)
    return callback(null, true)
  },
  credentials: true
}))
app.use(express.json({ limit: '100kb' }))

// Rate limiting: allow ample headroom for multi-user real-time work
const maxRequests = process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 2000
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
}))
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }))

// ---- REST API routes ----
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/storage', storageRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/transactions', transactionRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

// ---- HTTP + WebSocket server on the same port ----
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

function broadcast(message) {
  const data = JSON.stringify(message)
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(data)
  })
}
app.locals.broadcast = broadcast

function broadcastPresence() {
  broadcast({
    type: 'presence:update',
    payload: {
      activeConnections: wss.clients.size,
      at: Date.now()
    }
  })
}

wss.on('connection', (socket) => {
  socket.isAlive = true
  socket.on('pong', () => {
    socket.isAlive = true
  })

  // Send initial connection acknowledgement with current active connection count
  socket.send(JSON.stringify({
    type: 'connection:ack',
    payload: {
      message: 'Connected to StockYard live feed',
      activeConnections: wss.clients.size,
      at: Date.now()
    }
  }))

  // Broadcast presence count so all users know another user joined
  broadcastPresence()

  socket.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString())
      if (msg.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', payload: { at: Date.now() } }))
      } else if (msg.type === 'presence:heartbeat') {
        socket.isAlive = true
        socket.send(JSON.stringify({ type: 'pong', payload: { at: Date.now() } }))
      }
    } catch {
      // ignore malformed client messages
    }
  })

  socket.on('close', () => {
    broadcastPresence()
  })
})

// Keep alive interval: ping connected sockets every 25s
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((socket) => {
    if (socket.isAlive === false) return socket.terminate()
    socket.isAlive = false
    socket.ping()
  })
}, 25000)

wss.on('close', () => {
  clearInterval(heartbeatInterval)
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
