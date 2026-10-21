import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useInterval } from '../hooks/useInterval.js'

const RealtimeContext = createContext(null)

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost'
  return `${protocol}//${host}:4000`
}

export function RealtimeProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState(1)
  const [lastEvent, setLastEvent] = useState(null)
  const [lastSyncedAt, setLastSyncedAt] = useState(Date.now())
  const [secondsAgo, setSecondsAgo] = useState(0)
  const socketRef = useRef(null)
  const listenersRef = useRef(new Set())

  // Unique identifier for this client session / browser tab
  const clientId = useMemo(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `client_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }, [])

  useEffect(() => {
    let retryTimer
    let cancelled = false
    const wsUrl = getWsUrl()

    function connect() {
      try {
        const ws = new WebSocket(wsUrl)
        socketRef.current = ws

        ws.onopen = () => {
          if (cancelled) return
          setConnected(true)
          setLastSyncedAt(Date.now())
        }

        ws.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data)
            setLastEvent(data)
            setLastSyncedAt(Date.now())

            // Track active connections presence count
            if (data.type === 'presence:update' && typeof data.payload?.activeConnections === 'number') {
              setActiveUsers(data.payload.activeConnections)
            } else if (data.type === 'connection:ack' && typeof data.payload?.activeConnections === 'number') {
              setActiveUsers(data.payload.activeConnections)
            }

            listenersRef.current.forEach((fn) => {
              try {
                fn(data)
              } catch (err) {
                console.error('[RealtimeContext] Subscriber error:', err)
              }
            })
          } catch {
            // ignore malformed payloads
          }
        }

        ws.onclose = () => {
          if (cancelled) return
          setConnected(false)
          retryTimer = setTimeout(connect, 3000)
        }

        ws.onerror = () => {
          try {
            ws.close()
          } catch {
            // ignore
          }
        }
      } catch {
        setConnected(false)
        retryTimer = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(retryTimer)
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  // Update seconds ago timer
  useInterval(() => {
    setSecondsAgo(Math.max(0, Math.round((Date.now() - lastSyncedAt) / 1000)))
  }, 1000)

  // Periodic heartbeat ping to keep connection alive through proxies
  useInterval(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify({ type: 'presence:heartbeat', clientId }))
      } catch {
        // ignore
      }
    }
  }, 20000)

  const subscribe = useCallback((fn) => {
    listenersRef.current.add(fn)
    return () => listenersRef.current.delete(fn)
  }, [])

  const sendMessage = useCallback((type, payload = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload, clientId }))
      return true
    }
    return false
  }, [clientId])

  const value = useMemo(() => ({
    connected,
    activeUsers,
    lastEvent,
    lastSyncedAt,
    secondsAgo,
    subscribe,
    sendMessage,
    clientId
  }), [connected, activeUsers, lastEvent, lastSyncedAt, secondsAgo, subscribe, sendMessage, clientId])

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext)
  if (!ctx) throw new Error('useRealtime must be used within RealtimeProvider')
  return ctx
}
