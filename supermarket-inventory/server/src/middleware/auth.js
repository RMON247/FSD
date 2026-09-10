import jwt from 'jsonwebtoken'

/**
 * requireAuth
 * Verifies the Bearer token on the Authorization header and attaches
 * { id, role } to req.user. Rejects with 401 if missing/invalid/expired.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Provide a Bearer token.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

/**
 * requireRole(...roles)
 * Must run after requireAuth. Rejects with 403 if req.user.role isn't allowed.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Requires one of these roles: ${roles.join(', ')}` })
    }
    next()
  }
}
