import jwt from 'jsonwebtoken'
import { AuthGuardMiddleware } from '../types'

const authGuard: AuthGuardMiddleware = (handler) => async (req, res) => {
  const accessToken = req.headers.authorization?.split(' ')[1]

  if (!accessToken) {
    return res.status(403).json({ message: 'Access token must be provided' })
  }

  const decodedToken = (await jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  )) as unknown as {
    userId: string
  }

  if (!decodedToken || !decodedToken.userId) {
    return res.status(403).json({ message: 'Invalid token' })
  }

  req.userId = decodedToken.userId

  return handler(req, res)
}

export default authGuard
