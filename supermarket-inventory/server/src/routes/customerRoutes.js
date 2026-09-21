import { Router } from 'express'
import { body, param } from 'express-validator'
import { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validate } from '../utils/validate.js'

const router = Router()

router.get('/', listCustomers)
router.get('/:id', param('id').isMongoId(), validate, getCustomer)

router.post(
  '/',
  requireAuth,
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('phone').trim().notEmpty()
  ],
  validate,
  createCustomer
)

router.put('/:id', requireAuth, param('id').isMongoId(), validate, updateCustomer)
router.delete('/:id', requireAuth, requireRole('admin'), param('id').isMongoId(), validate, deleteCustomer)

export default router
