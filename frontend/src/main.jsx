import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from "react-hot-toast"

import './index.css'
import App from './App.jsx'
import { store } from './redux/store.js'

export const serverUrl = "https://realtimetalk-backend.onrender.com"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
        {/* ✅ ADD THIS LINE */}
        <Toaster position="top-center" reverseOrder={false} />
      </Provider>
    </BrowserRouter>
  </StrictMode>
)
