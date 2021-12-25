import { Router } from 'express'
import { checkJwt } from '../utils/checkJwt.js'

const router = Router()

router.get('/public', (req, res) => {
  res.status(200).json({ message: 'Public message' })
})

router.get('/protected', checkJwt, (req, res) => {
  res.status(200).json({ message: 'Protected message' })
})

export default router
