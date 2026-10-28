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

  const refreshUser = useCallback(async () => {
    if (!token) return null
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          return data.user
        }
      } else if (res.status === 401) {
        logout()
      }
    } catch {
      // ignore network errors
    }
    return null
  }, [token, setUser, logout])

  const authHeader = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token])

  const isVerified = Boolean(user?.isVerified)
  const isAdmin = user?.role === 'admin' && isVerified
  const canWrite = (user?.role === 'admin' || user?.role === 'manager') && isVerified
  const isViewer = user?.role === 'viewer'

  const value = useMemo(() => ({
    token,
    user,
    setUser,
    isAuthenticated: !!token && !!user,
    isVerified,
    isAdmin,
    canWrite,
    isViewer,
    role: user?.role || 'guest',
    login,
    register,
    logout,
    refreshUser,
    authHeader
  }), [token, user, setUser, isVerified, isAdmin, canWrite, isViewer, login, register, logout, refreshUser, authHeader])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { API_URL }
