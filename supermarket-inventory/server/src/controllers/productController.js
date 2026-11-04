import Product from '../models/Product.js'
import Transaction from '../models/Transaction.js'

export async function listProducts(req, res, next) {
  try {
    const { search, category, status } = req.query
    const query = { organizationId: req.organizationId }

    if (search) query.$text = { $search: search }
    if (category && category !== 'All') query.category = category

    let products = await Product.find(query).sort({ name: 1 })

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
    const product = await Product.findOne({ _id: req.params.id, organizationId: req.organizationId })
    if (!product) return res.status(404).json({ message: 'Product not found.' })
    res.json({ product })
  } catch (err) {
    next(err)
  }
}

export async function createProduct(req, res, next) {
  try {
    const payload = { ...req.body, organizationId: req.organizationId }

    if (!payload.sku || !payload.sku.trim()) {
      const prefix = (payload.category || 'PR').slice(0, 2).toUpperCase()
      payload.sku = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`
    } else {
      payload.sku = payload.sku.trim().toUpperCase()
    }

    const product = await Product.create(payload)
    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    let tx = null
    if (product.quantity > 0) {
      tx = await Transaction.create({
        organizationId: req.organizationId,
        type: 'Stock In',
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: product.quantity,
        reason: 'New Product Added',
        storageId: product.storageId,
        user: actor
      })
    }

    req.app.locals.broadcast?.({
      type: 'product:created',
      organizationId: req.organizationId.toString(),
      payload: product,
      actor,
      clientId
    })

    if (tx) {
      req.app.locals.broadcast?.({
        type: 'transaction:created',
        organizationId: req.organizationId.toString(),
        payload: tx,
        actor,
        clientId
      })
    }

    res.status(201).json({ product, transaction: tx })
  } catch (err) {
    next(err)
  }
}

export async function updateProduct(req, res, next) {
  try {
    const payload = { ...req.body }
    delete payload.organizationId

    if (payload.sku === '') {
      delete payload.sku
    } else if (payload.sku) {
      payload.sku = payload.sku.trim().toUpperCase()
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      payload,
      { new: true, runValidators: true }
    )
    if (!product) return res.status(404).json({ message: 'Product not found.' })

    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    req.app.locals.broadcast?.({
      type: 'product:updated',
      organizationId: req.organizationId.toString(),
      payload: product,
      actor,
      clientId
    })

    res.json({ product })
  } catch (err) {
    next(err)
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId })
    if (!product) return res.status(404).json({ message: 'Product not found.' })

    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    req.app.locals.broadcast?.({
      type: 'product:deleted',
      organizationId: req.organizationId.toString(),
      payload: { id: product._id, name: product.name },
      actor,
      clientId
    })

    res.json({ message: 'Product deleted.' })
  } catch (err) {
    next(err)
  }
}

export async function adjustStock(req, res, next) {
  try {
    const { direction, quantity, reason } = req.body
    const product = await Product.findOne({ _id: req.params.id, organizationId: req.organizationId })
    if (!product) return res.status(404).json({ message: 'Product not found.' })

    const delta = direction === 'in' ? quantity : -quantity
    product.quantity = Math.max(0, product.quantity + delta)
    await product.save()

    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    const tx = await Transaction.create({
      organizationId: req.organizationId,
      type: direction === 'in' ? 'Stock In' : 'Stock Out',
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      quantity,
      reason: reason || (direction === 'in' ? 'Manual Restock' : 'Manual Deduction'),
      storageId: product.storageId,
      user: actor
    })

    req.app.locals.broadcast?.({
      type: 'product:updated',
      organizationId: req.organizationId.toString(),
      payload: product,
      actor,
      clientId
    })

    req.app.locals.broadcast?.({
      type: 'stock:update',
      organizationId: req.organizationId.toString(),
      payload: {
        id: product._id,
        product,
        name: product.name,
        quantity: product.quantity,
        direction,
        reason: tx.reason
      },
      actor,
      clientId
    })

    req.app.locals.broadcast?.({
      type: 'transaction:created',
      organizationId: req.organizationId.toString(),
      payload: tx,
      actor,
      clientId
    })

    res.json({ product, transaction: tx })
  } catch (err) {
    next(err)
  }
}
