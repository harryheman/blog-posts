import { Router } from 'express'
import { setCookie } from '../middlewares/setCookie.js'
import authRoutes from './auth.routes.js'

const router = Router()

router.use('/auth', authRoutes).use(setCookie)

export default router
