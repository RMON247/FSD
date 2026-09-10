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
    storageId: { type: String, trim: true }
  },
  { timestamps: true }
)

// Virtual field: derived status, mirrors the frontend's logic — not stored, always computed
productSchema.virtual('status').get(function status() {
  if (this.quantity === 0) return 'Out of Stock'
  if (this.quantity <= this.minStock) return 'Low Stock'
  return 'In Stock'
})

productSchema.set('toJSON', { virtuals: true })

productSchema.index({ name: 'text', sku: 'text' })

export default mongoose.model('Product', productSchema)
