const express = require('express')
const app = express()

// директория со статическими файлами
app.use(express.static('public'))

// решаем проблему с отсутствующей фавиконкой
app.get('/favicon.ico', (_, res) => {
  res.sendStatus(200)
})

// импорт модулей + куки
app.get('/node_modules/*', (req, res) => {
  // куки
  res.cookie('cookie_localhost', 'Do_you_want_some_cookies?', {
    // это чтобы сохранить `?`
    encode: encodeURI
  })
  res.sendFile(`${__dirname}${req.url}`)
})

// данные для кеша
app.get('/get-data-for-cache', (_, res) => {
  res.send('data for cache from localhost')
})

// ответ с сообщением и заголовком `Clear-Site-Data` с соответствующей директивой
app.get('/*', (req, res) => {
  const type = req.url.split('-')[1]

  if (!type) return res.sendStatus(400)

  res.set('Clear-Site-Data', `"${type}"`)
  res.json({
    message: `Data for localhost has been removed from ${type}`
  })
})

// поехали!
app.listen(3000, () => {
  console.log('Server ready 🚀')
})
