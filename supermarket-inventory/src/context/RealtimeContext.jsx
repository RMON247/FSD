import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useInterval } from '../hooks/useInterval.js'

const RealtimeContext = createContext(null)

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000'

export function RealtimeProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState(null)
  const [lastSyncedAt, setLastSyncedAt] = useState(Date.now())
  const [secondsAgo, setSecondsAgo] = useState(0)
  const socketRef = useRef(null)
  const listenersRef = useRef(new Set())

  // useEffect: open a WebSocket connection to the backend on mount, clean up on unmount
  useEffect(() => {
    let retryTimer
    let cancelled = false

    function connect() {
      try {
        const ws = new WebSocket(WS_URL)
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
            listenersRef.current.forEach((fn) => fn(data))
          } catch {
            // ignore malformed payloads
          }
        }
        ws.onclose = () => {
          if (cancelled) return
          setConnected(false)
          retryTimer = setTimeout(connect, 4000) // auto-reconnect
        }
        ws.onerror = () => ws.close()
      } catch {
        setConnected(false)
      }
    }

    connect()
    return () => {
      cancelled = true
      clearTimeout(retryTimer)
      socketRef.current?.close()
    }
  }, [])

  // custom hook useInterval: ticks every second to keep "synced Xs ago" live, no matter the connection state
  useInterval(() => {
    setSecondsAgo(Math.round((Date.now() - lastSyncedAt) / 1000))
  }, 1000)

  const subscribe = useCallback((fn) => {
    listenersRef.current.add(fn)
    return () => listenersRef.current.delete(fn)
  }, [])

  return (
    <RealtimeContext.Provider value={{ connected, lastEvent, secondsAgo, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext)
  if (!ctx) throw new Error('useRealtime must be used within RealtimeProvider')
  return ctx
}
