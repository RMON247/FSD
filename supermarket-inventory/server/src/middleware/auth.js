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
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  try {
    const userDoc = await User.findById(req.user.id).select('isVerified role name email')
    if (!userDoc) {
      return res.status(401).json({ message: 'User account no longer exists.' })
    }
    req.user.isVerified = !!userDoc.isVerified
    req.user.role = userDoc.role
    req.user.name = userDoc.name
    req.user.email = userDoc.email

    if (!userDoc.isVerified) {
      return res.status(403).json({
        message: 'Account pending verification. An administrator must verify and approve your account before you can access warehouse data.'
      })
    }
    next()
  } catch {
    return res.status(500).json({ message: 'Error checking user verification status.' })
  }
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    try {
      // Query database to ensure fresh role and verification in case admin updated access in real time
      const userDoc = await User.findById(req.user.id).select('role name email isVerified')
      if (userDoc) {
        req.user.role = userDoc.role
        req.user.name = userDoc.name
        req.user.email = userDoc.email
        req.user.isVerified = !!userDoc.isVerified

        if (!userDoc.isVerified) {
          return res.status(403).json({
            message: 'Account pending verification. An administrator must verify and approve your account before you can access warehouse data.'
          })
        }
      }
    } catch {
      // fallback to token role
    }

    if (!roles.includes(req.user.role)) {
      const isWriteCheck = roles.includes('admin') && roles.includes('manager')
      const message = isWriteCheck
        ? 'Write and edit access required. Only administrators or users granted access by an admin can modify records.'
        : 'Administrator privileges required. You do not have permission to perform this action.'
      return res.status(403).json({ message })
    }
    next()
  }
}
