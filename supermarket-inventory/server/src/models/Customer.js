import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    status: { type: String, default: 'Active', trim: true },
    joinedOn: { type: Date, default: Date.now },
    totalPurchases: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    purchaseHistory: { type: Array, default: [] }
  },
  { timestamps: true }
)

customerSchema.set('toJSON', { virtuals: true })

export default mongoose.model('Customer', customerSchema)
