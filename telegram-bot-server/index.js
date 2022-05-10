import axios from 'axios'
// import fs from 'fs-extra'
// import { join } from 'path'
import { config } from 'dotenv'
import express from 'express'
import { GoogleSpreadsheet } from 'google-spreadsheet'

config()
const app = express()

const JOKE_API = 'https://v2.jokeapi.dev/joke/Programming?type=single'
const TELEGRAM_URI = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`

app.use(express.json())
app.use(
  express.urlencoded({
    extended: true
  })
)

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID)
await doc.useServiceAccountAuth({
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
})

app.post('/new-message', async (req, res) => {
  const { message } = req.body

  const messageText = message?.text?.toLowerCase()?.trim()
  const chatId = message?.chat?.id
  if (!messageText || !chatId) {
    return res.sendStatus(400)
  }

  // local json
  // const dataFromJson = fs.readJSONSync(join(process.cwd(), 'todos.json'))

  // google spreadsheet
  await doc.loadInfo()
  const sheet = doc.sheetsByIndex[0]
  const rows = await sheet.getRows()
  const dataFromSpreadsheet = rows.reduce((obj, row) => {
    if (row.date) {
      const todo = { text: row.text, done: row.done }
      obj[row.date] = obj[row.date] ? [...obj[row.date], todo] : [todo]
    }
    return obj
  }, {})

  let responseText = 'I have nothing to say.'
  // generate responseText
  if (messageText === 'joke') {
    try {
      const response = await axios(JOKE_API)
      responseText = response.data.joke
    } catch (e) {
      console.log(e)
      res.status(400).send(e)
    }
  } else if (/\d\d\.\d\d/.test(messageText)) {
    // responseText = dataFromJson[messageText] || 'You have nothing to to on this day.'
    responseText =
      dataFromSpreadsheet[messageText] || 'You have nothing to to on this day.'
  }

  // send response
  try {
    await axios.post(TELEGRAM_URI, {
      chat_id: chatId,
      text: responseText
    })
    res.send('Done')
  } catch (e) {
    console.log(e)
    res.status(400).send(e)
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
