import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function signToken(user) {
  return jwt.sign(
    { sub: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' })

    // If an admin already exists, default new registrations to 'viewer' with pending verification (isVerified: false).
    // If no admin exists yet, the first registered user becomes 'admin' and is auto-verified.
    const adminExists = await User.exists({ role: 'admin' })
    const role = adminExists ? 'viewer' : 'admin'
    const isVerified = !adminExists

    const user = await User.create({ name, email, password, role, isVerified })
    const token = signToken(user)

    req.app.locals.broadcast?.({
      type: 'user:registered',
      payload: user.toSafeObject()
    })

    res.status(201).json({
      token,
      user: user.toSafeObject(),
      message: isVerified
        ? 'Account created and verified as administrator.'
        : 'Account created. Verification by an administrator is required before accessing warehouse data.'
    })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }
    const token = signToken(user)
    res.json({ token, user: user.toSafeObject() })
  } catch (err) {
    next(err)
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json({ user: user.toSafeObject() })
  } catch (err) {
    next(err)
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({ count: users.length, users: users.map((u) => u.toSafeObject()) })
  } catch (err) {
    next(err)
  }
}

export async function updateUserAuthorization(req, res, next) {
  try {
    const { role, isVerified } = req.body

    if (role !== undefined && !['admin', 'manager', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin, manager, or viewer.' })
    }
    if (isVerified !== undefined && typeof isVerified !== 'boolean') {
      return res.status(400).json({ message: 'isVerified must be a boolean.' })
    }

    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ message: 'User not found.' })

    // Safety: Prevent removing or un-verifying the last admin
    const removingAdminRole = role !== undefined && targetUser.role === 'admin' && role !== 'admin'
    const unapprovingAdmin = isVerified === false && targetUser.role === 'admin'
    if (removingAdminRole || unapprovingAdmin) {
      const adminCount = await User.countDocuments({ role: 'admin', isVerified: true })
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot modify or un-verify the only remaining active administrator.' })
      }
    }

    if (role !== undefined) targetUser.role = role
    if (isVerified !== undefined) targetUser.isVerified = isVerified

    await targetUser.save()

    const safeUser = targetUser.toSafeObject()
    const actor = req.user?.name || 'Administrator'
    const clientId = req.headers['x-client-id']

    req.app.locals.broadcast?.({
      type: 'user:authorized',
      payload: {
        id: targetUser._id.toString(),
        role: targetUser.role,
        isVerified: targetUser.isVerified,
        user: safeUser
      },
      actor,
      clientId
    })

    // Also send user:role_updated for backwards compatibility
    req.app.locals.broadcast?.({
      type: 'user:role_updated',
      payload: {
        id: targetUser._id.toString(),
        role: targetUser.role,
        isVerified: targetUser.isVerified,
        user: safeUser
      },
      actor,
      clientId
    })

    const statusText = targetUser.isVerified ? 'verified' : 'pending verification'
    res.json({
      user: safeUser,
      message: `Authorization updated for ${targetUser.name}: Role=${targetUser.role}, Status=${statusText}.`
    })
  } catch (err) {
    next(err)
  }
}

export async function verifyUser(req, res, next) {
  try {
    const isVerified = req.body.isVerified !== undefined ? Boolean(req.body.isVerified) : true
    req.body = { ...req.body, isVerified }
    return updateUserAuthorization(req, res, next)
  } catch (err) {
    next(err)
  }
}

export async function updateUserRole(req, res, next) {
  return updateUserAuthorization(req, res, next)
}

export async function deleteUser(req, res, next) {
  try {
    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ message: 'User not found.' })

    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own administrator account.' })
    }

    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the only administrator.' })
      }
    }

    await User.findByIdAndDelete(req.params.id)

    const actor = req.user?.name || 'Administrator'
    const clientId = req.headers['x-client-id']

    req.app.locals.broadcast?.({
      type: 'user:deleted',
      payload: { id: targetUser._id.toString(), name: targetUser.name },
      actor,
      clientId
    })

    res.json({ message: `User ${targetUser.name} deleted.` })
  } catch (err) {
    next(err)
  }
}
