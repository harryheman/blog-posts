import express from 'express'

const app = express()

app.use(express.static('public'))

const html1 = `<div>
  <p>hello world</p>
  <button
    name="my-button"
    value="some-value"
    hx-get="/clicked"
  >
    click me
  </button>
</div>`
const html2 = `<span>no more swaps</span>`

app.post('/clicked', (req, res) => {
  res.send(html1)
})
app.get('/clicked', (req, res) => {
  res.send(html2)
})

app.listen(3000)
