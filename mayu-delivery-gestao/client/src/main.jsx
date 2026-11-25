import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// A API em nuvem é configurada pela variável VITE_API_URL na Vercel.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

axios.defaults.baseURL = API_URL
console.log('API URL configurada para:', API_URL)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
