import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'

export default function MessageList({ log, messages, removeMessage }) {
  const logRef = useRef()
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current.scrollIntoView({
      behavior: 'smooth'
    })
  }, [messages])

  useEffect(() => {
    if (log) {
      logRef.current.style.opacity = 0.8
      logRef.current.style.zIndex = 1

      const timerId = setTimeout(() => {
        logRef.current.style.opacity = 0
        logRef.current.style.zIndex = -1

        clearTimeout(timerId)
      }, 1500)
    }
  }, [log])

  return (
    <div className='container message'>
      <h2>Messages</h2>
      <ul className='list message'>
        {messages.map((message) => (
          <MessageItem
            key={message.messageId}
            message={message}
            removeMessage={removeMessage}
          />
        ))}

        <p ref={bottomRef}></p>

        <p ref={logRef} className='log'>
          {log}
        </p>
      </ul>
    </div>
  )
}
