import { createContext, useContext, useCallback, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function AuthProvider({ children }) {
  const [token, setToken] = useLocalStorage('stockyard-token', null)
  const [user, setUser] = useLocalStorage('stockyard-user', null)

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [setToken, setUser])

  const register = useCallback(async (name, email, password) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || data.errors?.[0]?.msg || 'Registration failed')
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [setToken, setUser])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [setToken, setUser])

  const authHeader = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token])

  const value = useMemo(() => ({
    token, user, isAuthenticated: !!token, login, register, logout, authHeader
  }), [token, user, login, register, logout, authHeader])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { API_URL }
