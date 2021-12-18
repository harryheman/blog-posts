import { Router } from 'express'
import {
  verifyAccess,
  verifyAuth,
  verifyPermission
} from '../middlewares/index.js'
import {
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  removeUser
} from '../services/auth.services.js'

const router = Router()

router
  .get('/', verifyAuth, getUser)
  .post('/register', registerUser)
  .post('/login', loginUser)
  .get('/logout', verifyAccess, logoutUser)
  .delete('/remove', [verifyAccess, verifyPermission], removeUser)

export default router
