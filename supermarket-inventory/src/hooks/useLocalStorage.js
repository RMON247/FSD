import { useState, useEffect } from 'react'

/**
 * Custom Hook: useLocalStorage
 * Persists state to localStorage and keeps it in sync.
 * Demonstrates: encapsulating reusable stateful logic in a custom hook.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore write errors (e.g. storage full / private mode)
    }
  }, [key, value])

  return [value, setValue]
}
