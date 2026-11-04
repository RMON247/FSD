import { Router } from 'express'
import { body, param } from 'express-validator'
import { listStorage, getStorage, createStorage, updateStorage, deleteStorage } from '../controllers/storageController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireOrganization, requireOrgRole } from '../middleware/tenant.js'
import { validate } from '../utils/validate.js'

const router = Router()

router.use(requireAuth, requireOrganization)

router.get('/', listStorage)
router.get('/:id', param('id').isMongoId(), validate, getStorage)

router.post(
  '/',
  requireOrgRole('admin', 'manager'),
  [
    body('name').trim().notEmpty().withMessage('Storage name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('capacity').toFloat().isFloat({ min: 0 }).withMessage('Capacity must be a valid non-negative number'),
    body('used').toFloat().isFloat({ min: 0 }).withMessage('Used capacity must be a valid non-negative number')
  ],
  validate,
  createStorage
)

router.put('/:id', requireOrgRole('admin', 'manager'), param('id').isMongoId(), validate, updateStorage)
router.delete('/:id', requireOrgRole('admin'), param('id').isMongoId(), validate, deleteStorage)

export default router
