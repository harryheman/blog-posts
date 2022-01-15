import React from 'react'

export const Error = ({ error }) => {
  const status = error.status || 500
  const message = error.message || 'Something went wrong. Try again later'
  const path = window.location.pathname

  return (
    <div className='error-box'>
      <h2>Error</h2>
      <p>Location: {path}</p>
      <p>Status: {status}</p>
      <p>Message: {message}</p>
    </div>
  )
}
