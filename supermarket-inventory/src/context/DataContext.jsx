import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { useAuth, API_URL } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'
import { useRealtime } from './RealtimeContext.jsx'
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
  return {
    ...t,
    id: t.id || t._id,
    productId: typeof t.productId === 'object' && t.productId !== null
      ? (t.productId._id || t.productId.id || String(t.productId))
      : String(t.productId)
  }
}

export function DataProvider({ children }) {
  const { authHeader, user, setUser } = useAuth()
  const { addToast } = useToast()
  const { subscribe, clientId } = useRealtime()

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
        'X-Client-Id': clientId,
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
  }, [authHeader, clientId])

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

  // Load everything from the database once authenticated and verified
  useEffect(() => {
    let cancelled = false

    if (!user || !user.isVerified) {
      setProducts([])
      setStorageLocations([])
      setCustomers([])
      setTransactions([])
      setLoading(false)
      setError(null)
      return
    }

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
  }, [user?.isVerified, user?.id, refreshProducts, refreshStorage, refreshCustomers, refreshTransactions, addToast])

  // Real-time synchronization over WebSocket
  useEffect(() => {
    if (!subscribe) return

    const unsubscribe = subscribe((event) => {
      if (!event || !event.type) return
      const isRemote = event.clientId !== clientId
      const actor = event.actor || 'A team member'

      switch (event.type) {
        case 'product:created': {
          if (!event.payload) break
          const p = normalizeProduct(event.payload)
          setProducts((prev) => {
            if (prev.some((item) => item.id === p.id || item._id === p.id)) {
              return prev.map((item) => (item.id === p.id || item._id === p.id ? p : item))
            }
            return [p, ...prev]
          })
          if (isRemote) {
            addToast(`${actor} added product "${p.name}"`, 'info')
          }
          break
        }

        case 'product:updated': {
          if (!event.payload) break
          const p = normalizeProduct(event.payload)
          setProducts((prev) =>
            prev.map((item) => (item.id === p.id || item._id === p.id ? { ...item, ...p } : item))
          )
          if (isRemote) {
            addToast(`${actor} updated product "${p.name}"`, 'info')
          }
          break
        }

        case 'stock:update': {
          const { id, product, name, quantity, direction, reason } = event.payload || {}
          if (product) {
            const p = normalizeProduct(product)
            setProducts((prev) =>
              prev.map((item) => (item.id === p.id || item._id === p.id ? p : item))
            )
          } else if (id) {
            const delta = direction === 'in' ? quantity : -quantity
            setProducts((prev) =>
              prev.map((item) => {
                if (item.id === id || item._id === id) {
                  const newQty = Math.max(0, item.quantity + delta)
                  const newStatus = newQty === 0 ? 'Out of Stock' : newQty <= item.minStock ? 'Low Stock' : 'In Stock'
                  const newValue = Number((item.price * newQty).toFixed(2))
                  return { ...item, quantity: newQty, status: newStatus, value: newValue }
                }
                return item
              })
            )
          }
          if (isRemote) {
            addToast(`${actor} adjusted stock for "${name || 'Product'}": ${direction === 'in' ? '+' : '-'}${quantity} units (${reason || 'Stock Update'})`, 'info')
          }
          break
        }

        case 'product:deleted': {
          const targetId = event.payload?.id
          const name = event.payload?.name
          if (targetId) {
            setProducts((prev) => prev.filter((item) => item.id !== targetId && item._id !== targetId))
            if (isRemote) {
              addToast(`${actor} deleted product ${name ? `"${name}"` : ''}`, 'info')
            }
          }
          break
        }

        case 'storage:created': {
          if (!event.payload) break
          const s = normalizeStorage(event.payload)
          setStorageLocations((prev) => {
            if (prev.some((item) => item.id === s.id || item._id === s.id)) {
              return prev.map((item) => (item.id === s.id || item._id === s.id ? s : item))
            }
            return [s, ...prev]
          })
          if (isRemote) {
            addToast(`${actor} added storage location "${s.name}"`, 'info')
          }
          break
        }

        case 'storage:updated': {
          if (!event.payload) break
          const s = normalizeStorage(event.payload)
          setStorageLocations((prev) =>
            prev.map((item) => (item.id === s.id || item._id === s.id ? { ...item, ...s } : item))
          )
          if (isRemote) {
            addToast(`${actor} updated storage location "${s.name}"`, 'info')
          }
          break
        }

        case 'storage:deleted': {
          const targetId = event.payload?.id
          const name = event.payload?.name
          if (targetId) {
            setStorageLocations((prev) => prev.filter((item) => item.id !== targetId && item._id !== targetId))
            if (isRemote) {
              addToast(`${actor} deleted storage location ${name ? `"${name}"` : ''}`, 'info')
            }
          }
          break
        }

        case 'customer:created': {
          if (!event.payload) break
          const c = normalizeCustomer(event.payload)
          setCustomers((prev) => {
            if (prev.some((item) => item.id === c.id || item._id === c.id)) {
              return prev.map((item) => (item.id === c.id || item._id === c.id ? c : item))
            }
            return [c, ...prev]
          })
          if (isRemote) {
            addToast(`${actor} registered customer "${c.name}"`, 'info')
          }
          break
        }

        case 'customer:updated': {
          if (!event.payload) break
          const c = normalizeCustomer(event.payload)
          setCustomers((prev) =>
            prev.map((item) => (item.id === c.id || item._id === c.id ? { ...item, ...c } : item))
          )
          if (isRemote) {
            addToast(`${actor} updated customer "${c.name}"`, 'info')
          }
          break
        }

        case 'customer:deleted': {
          const targetId = event.payload?.id
          const name = event.payload?.name
          if (targetId) {
            setCustomers((prev) => prev.filter((item) => item.id !== targetId && item._id !== targetId))
            if (isRemote) {
              addToast(`${actor} removed customer ${name ? `"${name}"` : ''}`, 'info')
            }
          }
          break
        }

        case 'transaction:created': {
          if (!event.payload) break
          const t = normalizeTransaction(event.payload)
          setTransactions((prev) => {
            if (prev.some((item) => item.id === t.id || item._id === t.id)) {
              return prev
            }
            return [t, ...prev]
          })
          break
        }

        case 'user:authorized':
        case 'user:role_updated': {
          const { id, role, isVerified, user: updatedUser } = event.payload || {}
          if (id && user && (user.id === id || user._id === id)) {
            setUser((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                ...(role ? { role } : {}),
                ...(isVerified !== undefined ? { isVerified } : {}),
                ...(updatedUser || {})
              }
            })
            if (isVerified && !user.isVerified) {
              addToast('Your account was verified by an administrator! Database access unlocked.', 'success')
            } else if (role === 'admin') {
              addToast('Your permissions have been upgraded to Administrator!', 'success')
            } else if (role === 'manager') {
              addToast('An administrator has granted you Write & Edit access!', 'success')
            } else if (role === 'viewer') {
              addToast('Your permissions were changed to Viewer (Read-only).', 'info')
            }
          }
          break
        }

        default:
          break
      }
    })

    return unsubscribe
  }, [subscribe, clientId, addToast, user, setUser])

  // ---- Products ----
  const addProduct = useCallback(async (data) => {
    const res = await api('/api/products', { method: 'POST', body: JSON.stringify(data) })
    if (res.product) {
      const p = normalizeProduct(res.product)
      setProducts((prev) => (prev.some((item) => item.id === p.id || item._id === p.id) ? prev : [p, ...prev]))
    }
    if (res.transaction) {
      const t = normalizeTransaction(res.transaction)
      setTransactions((prev) => (prev.some((item) => item.id === t.id || item._id === t.id) ? prev : [t, ...prev]))
    }
  }, [api])

  const updateProduct = useCallback(async (id, data) => {
    const res = await api(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    if (res.product) {
      const p = normalizeProduct(res.product)
      setProducts((prev) => prev.map((item) => (item.id === id || item._id === id ? p : item)))
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
      const p = normalizeProduct(res.product)
      setProducts((prev) => prev.map((item) => (item.id === productId || item._id === productId ? p : item)))
    }
    if (res.transaction) {
      const t = normalizeTransaction(res.transaction)
      setTransactions((prev) => (prev.some((item) => item.id === t.id || item._id === t.id) ? prev : [t, ...prev]))
    }
  }, [api])

  // ---- Storage ----
  const addStorage = useCallback(async (data) => {
    const res = await api('/api/storage', { method: 'POST', body: JSON.stringify(data) })
    if (res.location) {
      const s = normalizeStorage(res.location)
      setStorageLocations((prev) => (prev.some((item) => item.id === s.id || item._id === s.id) ? prev : [s, ...prev]))
    }
  }, [api])

  const updateStorage = useCallback(async (id, data) => {
    const res = await api(`/api/storage/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    if (res.location) {
      const s = normalizeStorage(res.location)
      setStorageLocations((prev) => prev.map((item) => (item.id === id || item._id === id ? s : item)))
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
      const c = normalizeCustomer(res.customer)
      setCustomers((prev) => (prev.some((item) => item.id === c.id || item._id === c.id) ? prev : [c, ...prev]))
    }
  }, [api])

  const updateCustomer = useCallback(async (id, data) => {
    const res = await api(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    if (res.customer) {
      const c = normalizeCustomer(res.customer)
      setCustomers((prev) => prev.map((item) => (item.id === id || item._id === id ? c : item)))
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
