import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import {
  products as seedProducts,
  storageLocations as seedStorage,
  customers as seedCustomers,
  transactions as seedTransactions,
  categories,
  suppliers
} from '../data/dummyData.js'

const DataContext = createContext(null)

function computeStatus(quantity, minStock) {
  if (quantity === 0) return 'Out of Stock'
  if (quantity <= minStock) return 'Low Stock'
  return 'In Stock'
}

function nextId(prefix, list) {
  const nums = list.map((item) => parseInt(String(item.id).split('-').pop(), 10)).filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `${prefix}-${String(max + 1).padStart(4, '0')}`
}

export function DataProvider({ children }) {
  const [products, setProducts] = useState(seedProducts)
  const [storageLocations, setStorageLocations] = useState(seedStorage)
  const [customers, setCustomers] = useState(seedCustomers)
  const [transactions, setTransactions] = useState(seedTransactions)

  const logTransaction = useCallback((entry) => {
    setTransactions((prev) => [
      {
        id: `TXN-${String(10000 + prev.length + Math.floor(Math.random() * 900))}`,
        date: new Date().toISOString(),
        user: 'Current User',
        ...entry
      },
      ...prev
    ])
  }, [])

  const addProduct = useCallback((data) => {
    setProducts((prev) => {
      const id = nextId('PRD', prev)
      const product = {
        id,
        sku: data.sku || id,
        name: data.name,
        category: data.category,
        supplierId: data.supplierId,
        price: Number(data.price) || 0,
        unit: data.unit || 'each',
        quantity: Number(data.quantity) || 0,
        minStock: Number(data.minStock) || 0,
        storageId: data.storageId,
        addedOn: new Date().toISOString(),
        status: computeStatus(Number(data.quantity) || 0, Number(data.minStock) || 0),
        value: Number(((Number(data.price) || 0) * (Number(data.quantity) || 0)).toFixed(2))
      }
      logTransaction({
        type: 'Stock In',
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: product.quantity,
        reason: 'New Product Added',
        storageId: product.storageId
      })
      return [product, ...prev]
    })
  }, [logTransaction])

  const updateProduct = useCallback((id, data) => {
    setProducts((prev) => prev.map((p) => {
      if (p.id !== id) return p
      const merged = { ...p, ...data, price: Number(data.price ?? p.price), quantity: Number(data.quantity ?? p.quantity), minStock: Number(data.minStock ?? p.minStock) }
      merged.status = computeStatus(merged.quantity, merged.minStock)
      merged.value = Number((merged.price * merged.quantity).toFixed(2))
      return merged
    }))
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const adjustStock = useCallback((productId, direction, quantity, reason) => {
    let productName = ''
    let sku = ''
    let storageId = ''
    setProducts((prev) => prev.map((p) => {
      if (p.id !== productId) return p
      const delta = direction === 'in' ? quantity : -quantity
      const newQty = Math.max(0, p.quantity + delta)
      productName = p.name
      sku = p.sku
      storageId = p.storageId
      return {
        ...p,
        quantity: newQty,
        status: computeStatus(newQty, p.minStock),
        value: Number((p.price * newQty).toFixed(2))
      }
    }))
    logTransaction({
      type: direction === 'in' ? 'Stock In' : 'Stock Out',
      productId,
      productName,
      sku,
      quantity,
      reason: reason || (direction === 'in' ? 'Manual Restock' : 'Manual Deduction'),
      storageId
    })
  }, [logTransaction])

  const addStorage = useCallback((data) => {
    setStorageLocations((prev) => {
      const id = data.id || nextId('WH', prev)
      const capacity = Number(data.capacity) || 0
      const used = Number(data.used) || 0
      const status = used >= capacity ? 'Full' : used / capacity > 0.85 ? 'Near Capacity' : data.status || 'Active'
      return [...prev, { id, name: data.name, location: data.location, type: data.type || 'Ambient', capacity, used, status }]
    })
  }, [])

  const updateStorage = useCallback((id, data) => {
    setStorageLocations((prev) => prev.map((s) => {
      if (s.id !== id) return s
      const merged = { ...s, ...data, capacity: Number(data.capacity ?? s.capacity), used: Number(data.used ?? s.used) }
      if (merged.used >= merged.capacity) merged.status = 'Full'
      else if (merged.used / merged.capacity > 0.85) merged.status = 'Near Capacity'
      else if (merged.status === 'Full' || merged.status === 'Near Capacity') merged.status = 'Active'
      return merged
    }))
  }, [])

  const deleteStorage = useCallback((id) => {
    setStorageLocations((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addCustomer = useCallback((data) => {
    setCustomers((prev) => {
      const id = nextId('CUST', prev)
      return [{
        id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status || 'Active',
        joinedOn: new Date().toISOString(),
        totalPurchases: 0,
        orderCount: 0,
        purchaseHistory: []
      }, ...prev]
    })
  }, [])

  const updateCustomer = useCallback((id, data) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [])

  const deleteCustomer = useCallback((id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const value = useMemo(() => ({
    products, addProduct, updateProduct, deleteProduct, adjustStock,
    storageLocations, addStorage, updateStorage, deleteStorage,
    customers, addCustomer, updateCustomer, deleteCustomer,
    transactions, logTransaction,
    categories, suppliers
  }), [products, storageLocations, customers, transactions, addProduct, updateProduct, deleteProduct, adjustStock, addStorage, updateStorage, deleteStorage, addCustomer, updateCustomer, deleteCustomer, logTransaction])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
