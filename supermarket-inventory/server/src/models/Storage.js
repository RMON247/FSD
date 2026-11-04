import mongoose from 'mongoose'

const storageSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Refrigerated', 'Frozen', 'Ambient', 'Staging'], default: 'Ambient' },
    capacity: { type: Number, required: true, min: 0 },
    used: { type: Number, required: true, min: 0, default: 0 }
  },
  { timestamps: true }
)

storageSchema.virtual('status').get(function status() {
  if (this.used >= this.capacity) return 'Full'
  if (this.capacity > 0 && this.used / this.capacity > 0.85) return 'Near Capacity'
  return 'Active'
})

storageSchema.set('toJSON', { virtuals: true })
storageSchema.index({ organizationId: 1 })

export default mongoose.model('Storage', storageSchema)
