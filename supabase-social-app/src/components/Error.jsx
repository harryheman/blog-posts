export const Error = ({ error }) => {
  console.error(error)
  const status = error.status || 500
  const message = error.message || 'Something went wrong.'
  const location = window.location.pathname

  return (
    <div className='error'>
      <h2>Error</h2>
      <p>Status: {status}</p>
      <p>Message: {message}</p>
      <p>Location: {location}</p>
      <button onClick={() => {
        window.location.reload()
      }}>Reload</button>
    </div>
  )
}
