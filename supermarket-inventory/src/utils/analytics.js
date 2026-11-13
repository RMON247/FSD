import { useMemo } from 'react'

/**
 * Calculates real-time 6-month stock movement trend from organization transactions.
 * Returns array of { month: string, in: number, out: number }
 */
export function calculateStockTrend(transactions = []) {
  const months = []
  const now = new Date()

  // Generate last 6 calendar months in chronological order
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`
    const label = d.toLocaleString('en-US', { month: 'short' })
    months.push({ key: monthKey, month: label, in: 0, out: 0 })
  }

  const monthMap = new Map(months.map((m) => [m.key, m]))

  // Aggregate actual stock movements
  for (const t of transactions) {
    if (!t.date) continue
    const tDate = new Date(t.date)
    const key = `${tDate.getFullYear()}-${tDate.getMonth()}`
    const bucket = monthMap.get(key)
    if (bucket) {
      const qty = Number(t.quantity) || 0
      if (t.type === 'Stock In') {
        bucket.in += qty
      } else if (t.type === 'Stock Out') {
        bucket.out += qty
      }
    }
  }

  return months.map(({ month, in: stockIn, out: stockOut }) => ({
    month,
    in: stockIn,
    out: stockOut
  }))
}

/**
 * Calculates current inventory valuation & unit count by category from organization products.
 * Returns array of { category: string, value: number, units: number } sorted by value desc.
 */
export function calculateCategoryBreakdown(products = [], categories = []) {
  const catMap = new Map()

  // Initialize for all recognized categories with 0
  for (const cat of categories) {
    catMap.set(cat, { category: cat, value: 0, units: 0 })
  }

  // Sum up actual product values and quantities
  for (const p of products) {
    const cat = p.category || 'Other'
    let entry = catMap.get(cat)
    if (!entry) {
      entry = { category: cat, value: 0, units: 0 }
      catMap.set(cat, entry)
    }
    const val = typeof p.value === 'number' ? p.value : (Number(p.price) || 0) * (Number(p.quantity) || 0)
    const qty = Number(p.quantity) || 0
    entry.value += val
    entry.units += qty
  }

  const result = Array.from(catMap.values()).map((c) => ({
    ...c,
    value: Number(c.value.toFixed(2))
  }))

  // If there are products, filter out categories with 0 value so charts show actual stock
  // If no products at all, return empty array
  if (products.length === 0) {
    return []
  }

  return result.filter((c) => c.units > 0 || c.value > 0).sort((a, b) => b.value - a.value)
}
