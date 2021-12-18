import { promises as fs } from 'fs'
import express from 'express'
import cors from 'cors'
import { filePath } from './seed.mjs'

const sleep = async (ms) =>
  new Promise((resolve) => {
    const timerId = setTimeout(() => {
      resolve()
      clearTimeout(timerId)
    }, ms)
  })

const app = express()

app.use(cors())
app.use(express.static('../client/build'))

let allItems = []
try {
  allItems = JSON.parse(await fs.readFile(filePath, 'utf-8'))
} catch (e) {
  console.error(e)
}

let allPages = {}
for (let i = 0, j = 1; i < allItems.length; i += 10, j++) {
  allPages[j] = allItems.slice(i, i + 10)
}

app.get('/all-items', async (req, res, next) => {
  try {
    res.status(200).json({ items: allItems })
  } catch (e) {
    next(e)
  }
})

app.get('/more-items', async (req, res, next) => {
  try {
    await sleep(1000)
    const { page } = req.query
    res.status(200).json({
      items: allItems.slice(0, page * 10),
      totalPages: Object.keys(allPages).length
    })
  } catch (e) {
    next(e)
  }
})

app.get('/items-by-page', async (req, res, next) => {
  try {
    await sleep(1000)
    const { page } = req.query
    res
      .status(200)
      .json({ items: allPages[page], totalPages: Object.keys(allPages).length })
  } catch (e) {
    next(e)
  }
})

app.use(errorHandler)

function errorHandler(err, req, res) {
  console.error(err.message || err)
  res.status(err.status || 500).json({ message: err.message || 'oops' })
}

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log('🚀')
})
