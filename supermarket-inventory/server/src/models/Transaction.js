import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true },
    type: { type: String, required: true, enum: ['Stock In', 'Stock Out'] },
    date: { type: Date, default: Date.now },
    user: { type: String, default: 'Current User' },
    productId: { type: String },
    productName: { type: String, required: true },
    sku: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String },
    storageId: { type: String }
  },
  { timestamps: true }
)

transactionSchema.set('toJSON', { virtuals: true })

export default mongoose.model('Transaction', transactionSchema)
