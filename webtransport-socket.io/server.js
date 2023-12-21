import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createServer } from 'node:https'
import express from 'express'
import { Server } from 'socket.io'
import { Http3Server } from '@fails-components/webtransport'

const key = readFileSync('./key.pem')
const cert = readFileSync('./cert.pem')

const app = express()
app.use('*', (req, res) => {
  res.sendFile(path.resolve('./index.html'))
})

const httpsServer = createServer({ key, cert }, app)

const port = process.env.PORT || 443

httpsServer.listen(port, () => {
  console.log(`Server listening at https://localhost:${port}`)
})

const io = new Server(httpsServer, {
  transports: ['polling', 'websocket', 'webtransport'],
})

io.on('connection', (socket) => {
  console.log(`connected with transport ${socket.conn.transport.name}`)

  socket.conn.on('upgrade', (transport) => {
    console.log(`transport upgraded to ${transport.name}`)
  })

  socket.on('disconnect', (reason) => {
    console.log(`disconnected due to ${reason}`)
  })
})

const h3Server = new Http3Server({
  port,
  host: '0.0.0.0',
  secret: 'changeit',
  cert,
  privKey: key,
})

h3Server.startServer()
;(async () => {
  const stream = await h3Server.sessionStream('/socket.io/')
  const sessionReader = stream.getReader()

  while (true) {
    const { done, value } = await sessionReader.read()
    if (done) {
      break
    }
    io.engine.onWebTransportSession(value)
  }
})()
