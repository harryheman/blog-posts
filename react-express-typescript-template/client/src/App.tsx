import './App.scss'
import React, { useState } from 'react'
import messageApi from './api'
import { Message } from '../../shared'

function App() {
  const [message, setMessage] = useState<Message | undefined>()
  const [error, setError] = useState<any>(null)

  const sendWrongMessage = () => {
    setMessage(undefined)

    messageApi.sendWrongMessage().then(setMessage).catch(setError)
  }

  const sendRightMessage = () => {
    setError(null)

    messageApi.sendRightMessage().then(setMessage).catch(setError)
  }

  return (
    <>
      <header>
        <h1>React + Express + TypeScript Template</h1>
      </header>
      <main>
        <div>
          <button onClick={sendWrongMessage} className='wrong-message'>
            Send wrong message
          </button>
          <button onClick={sendRightMessage} className='right-message'>
            Send right message
          </button>
          <button onClick={() => window.location.reload()}>
            Reload window
          </button>
        </div>
        {message && (
          <div className='message-container'>
            <h2>{message.title}</h2>
            <p>{message.body}</p>
          </div>
        )}
        {error && <p className='error-message'>{error.message}</p>}
      </main>
      <footer>
        <p>&copy; 2021. Not all rights reserved</p>
      </footer>
    </>
  )
}

export default App
