import { Router } from 'express'
import { body, param } from 'express-validator'
import { listStorage, getStorage, createStorage, updateStorage, deleteStorage } from '../controllers/storageController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validate } from '../utils/validate.js'

const router = Router()

router.get('/', listStorage)
router.get('/:id', param('id').isMongoId(), validate, getStorage)

router.post(
  '/',
  requireAuth,
  [
    body('name').trim().notEmpty().withMessage('Storage name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('capacity').toFloat().isFloat({ min: 0 }).withMessage('Capacity must be a valid non-negative number'),
    body('used').toFloat().isFloat({ min: 0 }).withMessage('Used capacity must be a valid non-negative number')
  ],
  validate,
  createStorage
)

router.put('/:id', requireAuth, param('id').isMongoId(), validate, updateStorage)
router.delete('/:id', requireAuth, requireRole('admin'), param('id').isMongoId(), validate, deleteStorage)

export default router
