import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'each', trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    minStock: { type: Number, required: true, min: 0, default: 0 },
    storageId: { type: String, trim: true },
    supplierId: { type: String, trim: true }
  },
  { timestamps: true }
)

// Virtual fields: derived, never stored, always computed on read
productSchema.virtual('status').get(function status() {
  if (this.quantity === 0) return 'Out of Stock'
  if (this.quantity <= this.minStock) return 'Low Stock'
  return 'In Stock'
})

productSchema.virtual('value').get(function value() {
  return Number((this.price * this.quantity).toFixed(2))
})

productSchema.set('toJSON', { virtuals: true })
productSchema.index({ name: 'text', sku: 'text' })

export default mongoose.model('Product', productSchema)
