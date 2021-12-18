import express from 'express'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'
import multer from 'multer'

const __dirname = dirname(fileURLToPath(import.meta.url))

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/')
    },
    filename(req, file, cb) {
      cb(null, `${file.originalname}.mp3`)
    }
  })
})

const app = express()
app.use(express.static('public'))
app.use(express.static('uploads'))

app.get('/favicon.ico', (req, res) => {
  res.sendStatus(200)
})

app.post('/save', upload.single('audio'), (req, res) => {
  res.sendStatus(201)
})

app.get('/records', async (req, res) => {
  try {
    let files = await fs.readdir(`${__dirname}/uploads`)
    files = files.filter((fileName) => fileName.split('.')[1] === 'mp3')
    res.status(200).json(files)
  } catch (e) {
    console.log(e)
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('🚀')
})
