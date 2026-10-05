import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { useAuth, API_URL } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'
import { categories, suppliers } from '../data/dummyData.js'

const DataContext = createContext(null)

// ---- normalization: map Mongo documents onto the shape the UI expects ----
function normalizeProduct(p) {
  return { ...p, id: p.id || p._id, addedOn: p.addedOn || p.createdAt }
}
function normalizeStorage(s) {
  return { ...s, id: s.id || s._id }
}
function normalizeCustomer(c) {
  return {
    ...c,
    id: c.id || c._id,
    joinedOn: c.joinedOn || c.createdAt,
    purchaseHistory: (c.purchaseHistory || []).map((o) => ({ ...o, id: o.id || o._id }))
  }
}
function normalizeTransaction(t) {
  return { ...t, id: t.id || t._id }
}

export function DataProvider({ children }) {
  const { authHeader } = useAuth()
  const { addToast } = useToast()

  const [products, setProducts] = useState([])
  const [storageLocations, setStorageLocations] = useState([])
  const [customers, setCustomers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const api = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...(options.headers || {})
      }
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const fieldErrors = data.errors?.map((e) => `${e.path || e.param}: ${e.msg}`).join('; ')
      const detailMsg = fieldErrors || data.details
      let errorMsg = data.message || `Request failed (${res.status})`
      if (detailMsg && !errorMsg.includes(detailMsg)) {
        errorMsg = `${errorMsg} (${detailMsg})`
      }
      throw new Error(errorMsg)
    }
    return data
  }, [authHeader])

  const refreshProducts = useCallback(async () => {
    const data = await api('/api/products')
    setProducts((data.products || []).map(normalizeProduct))
  }, [api])

  const refreshStorage = useCallback(async () => {
    const data = await api('/api/storage')
    setStorageLocations((data.locations || []).map(normalizeStorage))
  }, [api])

  const refreshCustomers = useCallback(async () => {
    const data = await api('/api/customers')
    setCustomers((data.customers || []).map(normalizeCustomer))
  }, [api])

  const refreshTransactions = useCallback(async () => {
    const data = await api('/api/transactions')
    setTransactions((data.transactions || []).map(normalizeTransaction))
  }, [api])

  // useEffect: load everything from the database once, on mount
  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([refreshProducts(), refreshStorage(), refreshCustomers(), refreshTransactions()])
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          addToast(`Could not load data from the backend: ${err.message}`, 'error')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Products ----
  const addProduct = useCallback(async (data) => {
    const res = await api('/api/products', { method: 'POST', body: JSON.stringify(data) })
    if (res.product) {
      setProducts((prev) => [normalizeProduct(res.product), ...prev])
    }
  }, [api])

  const updateProduct = useCallback(async (id, data) => {
    const res = await api(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    if (res.product) {
      setProducts((prev) => prev.map((p) => (p.id === id || p._id === id ? normalizeProduct(res.product) : p)))
    }
  }, [api])

  const deleteProduct = useCallback(async (id) => {
    await api(`/api/products/${id}`, { method: 'DELETE' })
    setProducts((prev) => prev.filter((p) => p.id !== id && p._id !== id))
  }, [api])

  const adjustStock = useCallback(async (productId, direction, quantity, reason) => {
    const res = await api(`/api/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ direction, quantity, reason })
    })
    if (res.product) {
      setProducts((prev) => prev.map((p) => (p.id === productId || p._id === productId ? normalizeProduct(res.product) : p)))
    }
  }, [api])

  // ---- Storage ----
  const addStorage = useCallback(async (data) => {
    const res = await api('/api/storage', { method: 'POST', body: JSON.stringify(data) })
    if (res.location) {
      setStorageLocations((prev) => [normalizeStorage(res.location), ...prev])
    }
  }, [api])

  const updateStorage = useCallback(async (id, data) => {
    const res = await api(`/api/storage/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    if (res.location) {
      setStorageLocations((prev) => prev.map((s) => (s.id === id || s._id === id ? normalizeStorage(res.location) : s)))
    }
  }, [api])

  const deleteStorage = useCallback(async (id) => {
    await api(`/api/storage/${id}`, { method: 'DELETE' })
    setStorageLocations((prev) => prev.filter((s) => s.id !== id && s._id !== id))
  }, [api])

  // ---- Customers ----
  const addCustomer = useCallback(async (data) => {
    const res = await api('/api/customers', { method: 'POST', body: JSON.stringify(data) })
    if (res.customer) {
      setCustomers((prev) => [normalizeCustomer(res.customer), ...prev])
    }
  }, [api])

  const updateCustomer = useCallback(async (id, data) => {
    const res = await api(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    if (res.customer) {
      setCustomers((prev) => prev.map((c) => (c.id === id || c._id === id ? normalizeCustomer(res.customer) : c)))
    }
  }, [api])

  const deleteCustomer = useCallback(async (id) => {
    await api(`/api/customers/${id}`, { method: 'DELETE' })
    setCustomers((prev) => prev.filter((c) => c.id !== id && c._id !== id))
  }, [api])

  // Wrap every mutator so a failed request surfaces as a toast instead of an
  // unhandled promise rejection, while still letting callers await it if they want.
  const withErrorToast = useCallback((fn) => async (...args) => {
    try {
      await fn(...args)
    } catch (err) {
      addToast(err.message || 'Something went wrong talking to the backend', 'error')
      throw err
    }
  }, [addToast])

  const value = useMemo(() => ({
    products, storageLocations, customers, transactions,
    loading, error,
    refreshAll: () => Promise.all([refreshProducts(), refreshStorage(), refreshCustomers(), refreshTransactions()]),
    addProduct: withErrorToast(addProduct),
    updateProduct: withErrorToast(updateProduct),
    deleteProduct: withErrorToast(deleteProduct),
    adjustStock: withErrorToast(adjustStock),
    addStorage: withErrorToast(addStorage),
    updateStorage: withErrorToast(updateStorage),
    deleteStorage: withErrorToast(deleteStorage),
    addCustomer: withErrorToast(addCustomer),
    updateCustomer: withErrorToast(updateCustomer),
    deleteCustomer: withErrorToast(deleteCustomer),
    categories, suppliers
  }), [
    products, storageLocations, customers, transactions, loading, error,
    refreshProducts, refreshStorage, refreshCustomers, refreshTransactions,
    addProduct, updateProduct, deleteProduct, adjustStock,
    addStorage, updateStorage, deleteStorage,
    addCustomer, updateCustomer, deleteCustomer, withErrorToast
  ])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
