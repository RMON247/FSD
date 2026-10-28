import { Router } from 'express'
import { listTransactions } from '../controllers/transactionController.js'
import { requireAuth, requireVerified } from '../middleware/auth.js'

const router = Router()

// All transaction database access requires an authenticated & admin-verified account
router.use(requireAuth, requireVerified)

// Transactions are created internally by the product stock-adjust endpoint,
// not directly by clients — so this only exposes reads.
router.get('/', listTransactions)

export default router
