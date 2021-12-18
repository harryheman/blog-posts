import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()

app.use(cors())

app.use(express.static('public'))

app.get('*', (req, res) => {
  res.sendFile(resolve(`${__dirname}/${decodeURIComponent(req.url)}`))
})

app.listen(5000, () => {
  console.log('🚀')
})
