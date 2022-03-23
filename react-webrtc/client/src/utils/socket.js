import { io } from 'socket.io-client'

const SERVER_URI = import.meta.env.DEV ? 'http://localhost:4000' : ''

const socket = io(SERVER_URI)

export default socket
