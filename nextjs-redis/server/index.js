const next = require('next')
const express = require('express')
const { CronJob } = require('cron')

const pageController = require('./utils/pageController')
const renderPage = require('./utils/renderPage')

const CACHED_PAGES = ['/', '/catalog', '/about']

const DEFAULT_CATEGORIES = [
  {
    id: 1,
    title: 'First category',
    products: []
  },
  {
    id: 2,
    title: 'Second category',
    products: []
  },
  {
    id: 3,
    title: 'Third category',
    products: []
  }
]

let allCategories = []

async function updateCategories() {
  try {
    const categories = await Promise.resolve(DEFAULT_CATEGORIES)
    allCategories = categories
  } catch (err) {
    console.error(err)
  }
}
updateCategories()

const cronJobForCategories = new CronJob(
  '0/20 * * * *',
  updateCategories,
  null,
  false,
  'Europe/Moscow'
)

const dev = process.env.ENV === 'development'

const app = next({ dev })

const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.use(express.static('static'))

  server.get('/_next/*', handle)

  server.get('/favicon.ico', handle)

  server.get('/current-categories', (_, res) => {
    res.json(allCategories)
  })

  server.get('*', pageController, (req, res) => {
    console.log('@route handler', req.path)

    if (req.path === '/clear-cache') {
      if (
        req.headers['x-verification-code'] &&
        req.headers['x-verification-code'] !== process.env.VERIFICATION_CODE
      ) {
        return res.sendStatus(403)
      }

      res.clearCache()

      return res.sendStatus(200)
    }

    if (CACHED_PAGES.includes(req.path)) {
      return renderPage(app, req, res)
    }

    return handle(req, res)
  })

  const port = process.env.PORT || 5000

  server.listen(port, (err) => {
    if (err) return console.error(err)

    console.log(`🚀 Server ready on port ${port}`)
  })

  if (!dev) {
    cronJobForCategories.start()
  }
})
