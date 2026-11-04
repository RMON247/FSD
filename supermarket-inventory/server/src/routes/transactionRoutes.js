import { Router } from 'express'
import { listTransactions } from '../controllers/transactionController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireOrganization } from '../middleware/tenant.js'

const router = Router()

router.use(requireAuth, requireOrganization)

router.get('/', listTransactions)

export default router
