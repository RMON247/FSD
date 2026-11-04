import { Router } from 'express'
import {
  listUserOrganizations,
  createOrganization,
  joinOrganization,
  getOrganizationDetails,
  regenerateInviteCode,
  updateMemberRole,
  removeMember
} from '../controllers/orgController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', listUserOrganizations)
router.post('/', createOrganization)
router.post('/join', joinOrganization)
router.get('/:id', getOrganizationDetails)
router.post('/:id/regenerate-code', regenerateInviteCode)
router.patch('/:id/members/:userId', updateMemberRole)
router.delete('/:id/members/:userId', removeMember)

export default router
