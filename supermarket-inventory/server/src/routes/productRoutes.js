import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct, adjustStock
} from '../controllers/productController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validate } from '../utils/validate.js'

const router = Router()

// Public reads — anyone can browse the catalog
router.get('/', listProducts)
router.get('/:id', param('id').isMongoId(), validate, getProduct)

// Authenticated writes — any logged-in manager/admin can create or update
router.post(
  '/',
  requireAuth,
  [
    body('name').trim().notEmpty(),
    body('sku').trim().notEmpty(),
    body('category').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('quantity').isInt({ min: 0 }),
    body('minStock').isInt({ min: 0 })
  ],
  validate,
  createProduct
)

router.put('/:id', requireAuth, param('id').isMongoId(), validate, updateProduct)

router.patch(
  '/:id/stock',
  requireAuth,
  [
    param('id').isMongoId(),
    body('direction').isIn(['in', 'out']),
    body('quantity').isInt({ min: 1 })
  ],
  validate,
  adjustStock
)

// Admin-only — deleting a product is destructive
router.delete('/:id', requireAuth, requireRole('admin'), param('id').isMongoId(), validate, deleteProduct)

export default router
