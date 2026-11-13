import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Organization from '../models/Organization.js'

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

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'admin',
      isVerified: true
    })

    const token = signToken(user)

    res.status(201).json({
      token,
      user: user.toSafeObject(),
      message: 'Account created successfully. Welcome to StockYard!'
    })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
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

    // Find organizations this user belongs to
    const orgs = await Organization.find({
      $or: [
        { owner: user._id },
        { 'members.user': user._id }
      ]
    }).select('name code location owner members')

    res.json({
      user: user.toSafeObject(),
      organizations: orgs.map((o) => ({
        id: o._id,
        _id: o._id,
        name: o.name,
        code: o.code,
        location: o.location,
        isOwner: o.owner.toString() === user._id.toString(),
        userRole: o.getUserRole(user._id)
      }))
    })
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
    const { role } = req.body
    if (role !== undefined && !['admin', 'manager', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin, manager, or viewer.' })
    }

    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ message: 'User not found.' })

    if (role !== undefined) targetUser.role = role
    targetUser.isVerified = true
    await targetUser.save()

    res.json({
      user: targetUser.toSafeObject(),
      message: `User ${targetUser.name} updated.`
    })
  } catch (err) {
    next(err)
  }
}

export async function verifyUser(req, res, next) {
  return updateUserAuthorization(req, res, next)
}

export async function updateUserRole(req, res, next) {
  return updateUserAuthorization(req, res, next)
}

export async function deleteUser(req, res, next) {
  try {
    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ message: 'User not found.' })

    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' })
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ message: `User ${targetUser.name} deleted.` })
  } catch (err) {
    next(err)
  }
}
