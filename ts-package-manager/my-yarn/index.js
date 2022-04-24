import express from 'express'

const app = express()

app.get('/my-yarn', (_, res) => {
  res.sendFile(`${process.cwd()}/index.html`)
})

const PORT = process.env.PORT || 3124
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
