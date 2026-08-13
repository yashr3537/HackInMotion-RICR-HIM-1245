import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './App.css'

const savedDarkMode =
  window.localStorage.getItem('airguard-dark-mode') === 'true'

if (savedDarkMode) {
  document.documentElement.classList.add('dark')
  document.documentElement.style.colorScheme = 'dark'
} else {
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = 'light'
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)