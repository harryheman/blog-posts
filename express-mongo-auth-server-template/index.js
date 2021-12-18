// import helmet from 'helmet'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import {
  ALLOWED_ORIGIN,
  MONGODB_URI,
  SENTRY_DSN,
  SERVER_PORT
} from './config/index.js'
import { setSecurityHeaders } from './middlewares/index.js'
import router from './routes/app.routes.js'

const app = express()

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app })
    ],
    tracesSampleRate: 1.0
  })

  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.tracingHandler())
}

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true
  })
)
// app.use(helmet())
app.use(setSecurityHeaders)

app.use(json())
app.use(urlencoded({ extended: true }))
app.use(cookieParser())

try {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  console.log('🚀 Connected to DB')
} catch (e) {
  console.log(`Error while connecting to DB: ${e}`)
}

app.use('/api', router)

if (process.env.NODE_ENV === 'production') {
  app.use(Sentry.Handlers.errorHandler())
} else {
  app.use((err, req, res) => {
    console.log(`${err.message || JSON.stringify(err, null, 2)}`)
    res.status(500).json({ message: 'Something went wrong. Try again later' })
  })
}

app.listen(SERVER_PORT || 3000, () => {
  console.log(`🚀 Server ready on http://localhost:${SERVER_PORT || 3000}`)
})
