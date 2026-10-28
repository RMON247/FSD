import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  register, login, me, listUsers, updateUserRole, updateUserAuthorization, verifyUser, deleteUser
} from '../controllers/authController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validate } from '../utils/validate.js'

const router = Router()

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  validate,
  register
)

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  login
)

router.get('/me', requireAuth, me)

// ---- Admin User Access & Verification Management ----
router.get('/users', requireAuth, requireRole('admin'), listUsers)

router.patch(
  '/users/:id/authorization',
  requireAuth,
  requireRole('admin'),
  [
    param('id').isMongoId().withMessage('Valid user ID is required'),
    body('role').optional().isIn(['admin', 'manager', 'viewer']).withMessage('Role must be admin, manager, or viewer'),
    body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean')
  ],
  validate,
  updateUserAuthorization
)

router.patch(
  '/users/:id/verify',
  requireAuth,
  requireRole('admin'),
  [
    param('id').isMongoId().withMessage('Valid user ID is required'),
    body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean')
  ],
  validate,
  verifyUser
)

router.patch(
  '/users/:id/role',
  requireAuth,
  requireRole('admin'),
  [
    param('id').isMongoId().withMessage('Valid user ID is required'),
    body('role').isIn(['admin', 'manager', 'viewer']).withMessage('Role must be admin, manager, or viewer')
  ],
  validate,
  updateUserRole
)

router.delete(
  '/users/:id',
  requireAuth,
  requireRole('admin'),
  param('id').isMongoId().withMessage('Valid user ID is required'),
  validate,
  deleteUser
)

export default router
