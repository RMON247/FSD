import Product from '../models/Product.js'

export async function listProducts(req, res, next) {
  try {
    const { search, category, status } = req.query
    const query = {}
    if (search) query.$text = { $search: search }
    if (category && category !== 'All') query.category = category

    let products = await Product.find(query).sort({ name: 1 })

    // status is a virtual (derived), so filter after the DB query
    if (status && status !== 'All') {
      products = products.filter((p) => p.status === status)
    }

    res.json({ count: products.length, products })
  } catch (err) {
    next(err)
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found.' })
    res.json({ product })
  } catch (err) {
    next(err)
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body)
    req.app.locals.broadcast?.({ type: 'product:created', payload: product })
    res.status(201).json({ product })
  } catch (err) {
    next(err)
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!product) return res.status(404).json({ message: 'Product not found.' })
    req.app.locals.broadcast?.({ type: 'product:updated', payload: product })
    res.json({ product })
  } catch (err) {
    next(err)
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found.' })
    req.app.locals.broadcast?.({ type: 'product:deleted', payload: { id: product._id } })
    res.json({ message: 'Product deleted.' })
  } catch (err) {
    next(err)
  }
}

/**
 * Stock adjustment endpoint — the "real-time" experiment (Exp 8).
 * Applies a stock-in / stock-out delta, then broadcasts the update to every
 * connected WebSocket client so all open dashboards refresh instantly.
 */
export async function adjustStock(req, res, next) {
  try {
    const { direction, quantity, reason } = req.body
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found.' })

    const delta = direction === 'in' ? quantity : -quantity
    product.quantity = Math.max(0, product.quantity + delta)
    await product.save()

    req.app.locals.broadcast?.({
      type: 'stock:update',
      payload: { id: product._id, name: product.name, quantity: product.quantity, direction, reason }
    })

    res.json({ product })
  } catch (err) {
    next(err)
  }
}
