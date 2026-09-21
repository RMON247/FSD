import mongoose from 'mongoose'

const purchaseSchema = new mongoose.Schema(
  {
    product: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now }
  },
  { _id: true }
)

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Active', 'Inactive', 'VIP'], default: 'Active' },
    totalPurchases: { type: Number, default: 0, min: 0 },
    orderCount: { type: Number, default: 0, min: 0 },
    purchaseHistory: [purchaseSchema]
  },
  { timestamps: true }
)

customerSchema.set('toJSON', { virtuals: true })

export default mongoose.model('Customer', customerSchema)
