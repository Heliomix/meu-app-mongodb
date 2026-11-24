import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Forçar o uso do IP do servidor para o ambiente Capacitor
const API_URL = 'http://192.168.4.10:3000';

axios.defaults.baseURL = API_URL;
console.log('API URL configurada para:', API_URL);

createRoot(document.getElementById('root')).render(
 <StrictMode>
 <App />
 </StrictMode>,
)