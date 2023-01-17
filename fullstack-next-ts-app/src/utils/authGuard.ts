import jwt from 'jsonwebtoken'
import { NextApiHandler, NextApiResponse } from 'next'
import { NextApiMiddleware } from '../types'

const authGuard: NextApiMiddleware<NextApiHandler, NextApiResponse> =
  (handler) => async (req, res) => {
    const accessToken = req.headers.authorization?.split(' ')[1]

    if (!accessToken) {
      return res.status(403).json({ message: 'Access token must be provided' })
    }

    const decodedToken = (await jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    )) as unknown as {
      payload: string
    }

    if (
      !decodedToken ||
      decodedToken.payload !== process.env.ACCESS_TOKEN_PAYLOAD
    ) {
      return res.status(403).json({ message: 'Invalid token' })
    }

    return handler(req, res)
  }

export default authGuard
