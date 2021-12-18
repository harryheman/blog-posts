import { ErrorRequestHandler } from 'express'

const onError: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err)
  const status = err.status || 500
  const message = err.message || 'Something went wrong. Try again later'
  res.status(status).json({ message })
}

export default onError
