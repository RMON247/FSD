import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Stock In', 'Stock Out'], required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    sku: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    date: { type: Date, default: Date.now },
    user: { type: String, default: 'System' },
    reason: { type: String, default: '' },
    storageId: { type: String }
  },
  { timestamps: true }
)

transactionSchema.set('toJSON', { virtuals: true })
transactionSchema.index({ date: -1 })

export default mongoose.model('Transaction', transactionSchema)
