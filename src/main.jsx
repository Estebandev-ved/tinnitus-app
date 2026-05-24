import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import UpdateManager from './components/UpdateManager';
import App from './App.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <UpdateManager>
          <App />
        </UpdateManager>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
)
