import { Router } from 'express'
import { body, param } from 'express-validator'
import { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireOrganization, requireOrgRole } from '../middleware/tenant.js'
import { validate } from '../utils/validate.js'

const router = Router()

router.use(requireAuth, requireOrganization)

router.get('/', listCustomers)
router.get('/:id', param('id').isMongoId(), validate, getCustomer)

router.post(
  '/',
  requireOrgRole('admin', 'manager'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required')
  ],
  validate,
  createCustomer
)

router.put('/:id', requireOrgRole('admin', 'manager'), param('id').isMongoId(), validate, updateCustomer)
router.delete('/:id', requireOrgRole('admin'), param('id').isMongoId(), validate, deleteCustomer)

export default router
