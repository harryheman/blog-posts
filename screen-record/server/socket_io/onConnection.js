import { saveData } from '../utils/saveData.js'

const socketByUser = {}
const dataChunks = {}

export const onConnection = (socket) => {
  socket.on('user:connected', (username) => {
    if (!socketByUser[socket.id]) {
      socketByUser[socket.id] = username
    }
  })

  socket.on('screenData:start', ({ data, username }) => {
    if (dataChunks[username]) {
      dataChunks[username].push(data)
    } else {
      dataChunks[username] = [data]
    }
  })

  socket.on('screenData:end', (username) => {
    if (dataChunks[username] && dataChunks[username].length) {
      saveData(dataChunks[username], username)
      dataChunks[username] = []
    }
  })

  socket.on('disconnect', () => {
    const username = socketByUser[socket.id]
    if (dataChunks[username] && dataChunks[username].length) {
      saveData(dataChunks[username], username)
      dataChunks[username] = []
    }
  })
}
