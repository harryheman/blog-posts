import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { onConnection } from './socket_io/onConnection.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

io.on('connection', onConnection)

server.listen(4000, () => {
  console.log('Server ready 🚀 ')
})
