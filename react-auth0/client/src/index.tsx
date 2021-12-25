import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import Auth0ProviderWithNavigate from 'providers/Auth0ProviderWithNavigate'
import { AppProvider } from 'providers/AppProvider'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <AppProvider>
          <App />
        </AppProvider>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
