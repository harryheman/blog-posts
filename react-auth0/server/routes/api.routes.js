import { Router } from 'express'
import messagesRoutes from './messages.routes.js'

const router = Router()

router.use('/messages', messagesRoutes)

export default router
