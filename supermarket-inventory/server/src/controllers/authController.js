import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function signToken(user) {
  return jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' })

    const user = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'manager' })
    const token = signToken(user)
    res.status(201).json({ token, user: user.toSafeObject() })
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
