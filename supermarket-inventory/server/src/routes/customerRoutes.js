import { Router } from 'express'
import { body, param } from 'express-validator'
import { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js'
import { requireAuth, requireVerified, requireRole } from '../middleware/auth.js'
import { validate } from '../utils/validate.js'

const router = Router()

// All customer database access requires an authenticated & admin-verified account
router.use(requireAuth, requireVerified)

router.get('/', listCustomers)
router.get('/:id', param('id').isMongoId(), validate, getCustomer)

router.post(
  '/',
  requireRole('admin', 'manager'),
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('phone').trim().notEmpty()
  ],
  validate,
  createCustomer
)

router.put('/:id', requireRole('admin', 'manager'), param('id').isMongoId(), validate, updateCustomer)
router.delete('/:id', requireRole('admin'), param('id').isMongoId(), validate, deleteCustomer)

export default router
