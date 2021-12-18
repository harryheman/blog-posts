import { Router } from 'express'
import { verifyAndCreateMessage } from '../middleware/verifyAndCreateMessage.js'
import { sendMessage } from '../services/api.services.js'

const router = Router()

router.post('/', verifyAndCreateMessage, sendMessage)

export default router
