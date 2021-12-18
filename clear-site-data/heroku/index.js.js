const express = require('express')
const app = express()
const cors = require('cors')

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: 'Content-Type'
  })
)

app.get('/favicon.ico', (_, res) => {
  res.sendStatus(200)
})

app.get('/get-data-for-cache', (_, res) => {
  res.send('data for cache from heroku')
})

app.get('/get-cookie', (_, res) => {
  res.cookie('cookie_heroku', 'Do_you_want_some_cookies?', {
    encode: encodeURI,
    sameSite: 'none',
    secure: true
  })
  res.send('Here is you cookie!')
})

app.get('/*', (req, res) => {
  const type = req.url.split('-')[1]

  if (!type) return res.sendStatus(400)

  res.set('Clear-Site-Data', `"${type}"`)

  res.json({
    message: `Data for heroku has been removed from ${type}`
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log('Server ready 🚀')
})
