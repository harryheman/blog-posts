import express from 'express'
import { __dirname } from './utils.js'
import projectRoutes from './routes/project.routes.js'
import apiRoutes from './routes/api.routes.js'

const app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/node_modules/*', (req, res) => {
  res.sendFile(`${__dirname}/${req.url}`)
})

app.use('/project', projectRoutes)
app.use('/api', apiRoutes)

app.use((err, req, res, next) => {
  console.error(err.message || err)
  res.sendStatus(err.status || 500)
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 -> ${PORT}`)
})
