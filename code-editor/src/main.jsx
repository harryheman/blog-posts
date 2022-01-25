import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

window.ondrop = (e) => {
  e.preventDefault()
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
