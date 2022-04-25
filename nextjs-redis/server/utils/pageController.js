const redis = require('redis')
require('dotenv').config()

const redisConfig = {
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST || 'localhost'}:6379`
}

async function createClient() {
  const client = redis.createClient(redisConfig)

  client.on('error', (err) => {
    console.error('@redis error', err)
  })

  client.on('connect', () => {
    console.log('@redis connect')
  })

  client.on('reconnecting', () => {
    console.log('@redis reconnecting')
  })

  client.on('end', () => {
    console.log('@redis disconnect')
  })

  try {
    await client.connect()
  } catch (err) {
    console.error(err)
  }

  return client
}

let redisClient

async function pageController(req, res, next) {
  if (!redisClient) {
    try {
      redisClient = await createClient()
    } catch (err) {
      console.error(err)
    }
  }

  console.log('@redis middleware', req.path)

  const cacheKey = req.path

  try {
    const html = await redisClient.get(cacheKey)

    if (html) {
      console.log('@from cache')

      return res.send(html)
    }

    res.saveHtmlToCache = (html) => {
      console.log('@to cache')

      redisClient.set(cacheKey, html).catch(console.error)
    }

    res.clearCache = () => {
      console.log('@clear cache')

      redisClient.flushAll().catch(console.error)
    }

    next()
  } catch (err) {
    console.error(err)
  }
}

module.exports = pageController
