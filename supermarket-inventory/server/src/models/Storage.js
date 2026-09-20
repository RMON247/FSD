import mongoose from 'mongoose'

const storageSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, default: 'Ambient', trim: true },
    capacity: { type: Number, required: true, min: 0, default: 0 },
    used: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, default: 'Active', trim: true }
  },
  { timestamps: true }
)

storageSchema.set('toJSON', { virtuals: true })

export default mongoose.model('Storage', storageSchema)
