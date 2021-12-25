import { useAuth0 } from '@auth0/auth0-react'
import { getProtectedMessage, getPublicMessage } from 'api/messages'
import { Boundary } from 'components/Boundary/Boundary'
import { useAppSetter } from 'providers/AppProvider'
import { useState } from 'react'
import './message.scss'

export const MessagePage = () => {
  const { setLoading, setError } = useAppSetter()
  const [message, setMessage] = useState('')
  const [type, setType] = useState('')

  const { getAccessTokenSilently } = useAuth0()

  function onGetPublicMessage() {
    setLoading(true)
    getPublicMessage()
      .then(setMessage)
      .catch(setError)
      .finally(() => {
        setType('public')
        setLoading(false)
      })
  }

  function onGetProtectedMessage() {
    setLoading(true)
    getAccessTokenSilently()
      .then(getProtectedMessage)
      .then(setMessage)
      .catch(setError)
      .finally(() => {
        setType('protected')
        setLoading(false)
      })
  }

  return (
    <Boundary>
      <h1>Message Page</h1>
      <div className='message'>
        <button onClick={onGetPublicMessage}>Get Public Message</button>
        <button onClick={onGetProtectedMessage}>Get Protected Message</button>
        {message && <h2 className={type}>{message}</h2>}
      </div>
    </Boundary>
  )
}
