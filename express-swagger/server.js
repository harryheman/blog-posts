import fs from 'fs'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import router from './routes/todo.routes.js'

const swaggerFile = JSON.parse(fs.readFileSync('./swagger/output.json'))

const app = express()

app.use(express.json())
app.use('/todos', router)
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
app.get('*', (req, res) => {
  res.send('Only /todos and /api-doc endpoints are available.')
})

app.use((err, req, res, next) => {
  console.log(err)
  const status = err.status || 500
  const message = err.message || 'Something went wrong. Try again later'
  res.status(status).json({ message })
})

app.listen(3000, () => {
  console.log('🚀 Server ready')
})
