import { Router } from 'express'
import { listTransactions } from '../controllers/transactionController.js'

const router = Router()

// Transactions are created internally by the product stock-adjust endpoint,
// not directly by clients — so this only exposes reads.
router.get('/', listTransactions)

export default router
