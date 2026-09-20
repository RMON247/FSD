import { Router } from 'express'
import {
  listStorage, createStorage, updateStorage, deleteStorage
} from '../controllers/storageController.js'

const router = Router()

router.get('/', listStorage)
router.post('/', createStorage)
router.put('/:id', updateStorage)
router.delete('/:id', deleteStorage)

export default router
