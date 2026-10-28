import { Router } from 'express'
import { body, param } from 'express-validator'
import { listStorage, getStorage, createStorage, updateStorage, deleteStorage } from '../controllers/storageController.js'
import { requireAuth, requireVerified, requireRole } from '../middleware/auth.js'
import { validate } from '../utils/validate.js'

const router = Router()

// All storage database access requires an authenticated & admin-verified account
router.use(requireAuth, requireVerified)

router.get('/', listStorage)
router.get('/:id', param('id').isMongoId(), validate, getStorage)

router.post(
  '/',
  requireRole('admin', 'manager'),
  [
    body('name').trim().notEmpty().withMessage('Storage name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('capacity').toFloat().isFloat({ min: 0 }).withMessage('Capacity must be a valid non-negative number'),
    body('used').toFloat().isFloat({ min: 0 }).withMessage('Used capacity must be a valid non-negative number')
  ],
  validate,
  createStorage
)

router.put('/:id', requireRole('admin', 'manager'), param('id').isMongoId(), validate, updateStorage)
router.delete('/:id', requireRole('admin'), param('id').isMongoId(), validate, deleteStorage)

export default router
