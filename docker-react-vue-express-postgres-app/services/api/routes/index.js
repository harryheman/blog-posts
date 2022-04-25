import { Router } from 'express'
import todoRoutes from './todo.routes.js'
import settingsRoutes from './settings.routes.js'

const router = Router()

router.use('/todo', todoRoutes)
router.use('/settings', settingsRoutes)

export default router
