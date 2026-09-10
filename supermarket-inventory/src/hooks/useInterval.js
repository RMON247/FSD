import { useEffect, useRef } from 'react'

/**
 * Custom Hook: useInterval
 * A declarative wrapper around setInterval built on top of useEffect + useRef.
 * Demonstrates: composing built-in hooks (useEffect, useRef) into a custom hook.
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
