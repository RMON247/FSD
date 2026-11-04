import mongoose from 'mongoose'

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'STK-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'manager', 'viewer'], default: 'manager' },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
)

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, default: generateInviteCode },
    description: { type: String, default: '', trim: true },
    location: { type: String, default: 'Main Facility', trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema]
  },
  { timestamps: true }
)

organizationSchema.methods.isMember = function isMember(userId) {
  const uId = userId.toString()
  if (this.owner.toString() === uId) return true
  return this.members.some((m) => m.user.toString() === uId)
}

organizationSchema.methods.getUserRole = function getUserRole(userId) {
  const uId = userId.toString()
  if (this.owner.toString() === uId) return 'admin'
  const member = this.members.find((m) => m.user.toString() === uId)
  return member ? member.role : null
}

export default mongoose.model('Organization', organizationSchema)
export { generateInviteCode }
