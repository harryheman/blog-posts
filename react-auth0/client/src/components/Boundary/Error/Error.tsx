import './error.scss'
import { useLocation, useNavigate } from 'react-router-dom'

export const Error = ({ error }: { error: any }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className='error'>
      <h2>Error</h2>
      <p>
        Location: <span>{pathname}</span>
      </p>
      {error.message && (
        <p>
          Message: <span>{error.message}</span>
        </p>
      )}
      <pre>{JSON.stringify(error, null, 2)}</pre>
      <div>
        <button onClick={() => navigate('/')}>Home</button>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    </div>
  )
}
