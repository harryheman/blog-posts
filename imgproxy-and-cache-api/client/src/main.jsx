import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

const render = () =>
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then((reg) => {
      if (reg.installing) {
        const sw = reg.installing || reg.waiting
        sw.onstatechange = () => {
          if (sw.state === 'activated') {
            render()
          }
        }
      } else {
        render()
      }
    })
    .catch(console.error)
} else {
  render()
}
