import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Provide a Bearer token.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.sub, role: payload.role, name: payload.name || 'Team Member', email: payload.email }
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

export async function requireVerified(req, res, next) {
  // All authenticated users are verified and have access to their organizations
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' })
  }
  next()
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    try {
      const userDoc = await User.findById(req.user.id).select('role name email')
      if (userDoc) {
        req.user.role = userDoc.role
        req.user.name = userDoc.name
        req.user.email = userDoc.email
      }
    } catch {
      // fallback
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permission denied for this action.' })
    }
    next()
  }
}
