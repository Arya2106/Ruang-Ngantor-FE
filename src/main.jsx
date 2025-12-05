import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  
import App from './routes/index.jsx'

import HomePage from './pages/HomePage.jsx'
import { UserProvider } from './components/UserContext.jsx'
import { NotificationSocketProvider } from './providers/NotificationSocket.jsx'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <NotificationSocketProvider>
        <ToastContainer autoClose={3000} position="top-right" />
    < App/>
    </NotificationSocketProvider>
    </UserProvider>
  </StrictMode>,
)
