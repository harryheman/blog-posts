import { Route } from '../types'
import { Message } from '../../../shared'

export const verifyAndCreateMessage: Route = (req, res, next) => {
  const message = <Message>req.body
  if (!message) {
    return res.status(400).json({ message: 'Message must be provided' })
  }
  if (message.body.includes('know')) {
    return res.status(400).json({ message: 'Nobody knows JavaScript' })
  }
  res.locals.message = {
    title: 'Message from server',
    body: 'Hello from server!'
  }
  next()
}
