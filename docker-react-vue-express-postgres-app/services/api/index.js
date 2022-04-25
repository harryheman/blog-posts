import express from 'express'
import cors from 'cors'
import Prisma from '@prisma/client'
import apiRoutes from './routes/index.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const { PrismaClient } = Prisma

export const prisma = new PrismaClient()

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()

app.use(cors())
app.use(express.json())

if (process.env.ENV === 'production') {
  const clientBuildPath = join(__dirname, 'client', 'build')
  const adminDistPath = join(__dirname, 'admin', 'dist')

  app.use(express.static(clientBuildPath))
  app.use(express.static(adminDistPath))
  app.use('/admin', (req, res) => {
    res.sendFile(join(adminDistPath, decodeURIComponent(req.url)))
  })
}
app.use('/api', apiRoutes)

app.use((err, req, res, next) => {
  console.log(err)
  const status = err.status || 500
  const message = err.message || 'Something went wrong. Try again later'
  res.status(status).json({ message })
})

app.listen(5000, () => {
  console.log(`Server ready 🚀 `)
})
