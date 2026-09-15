import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './contexts/AuthContext';
import { PlanProvider } from './contexts/PlanContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BackendAuthProvider } from './contexts/BackendAuthContext';
import UpdateManager from './components/UpdateManager';
import App from './App.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PlanProvider>
        <LanguageProvider>
          <BackendAuthProvider>
            <UpdateManager>
              <App />
            </UpdateManager>
          </BackendAuthProvider>
        </LanguageProvider>
      </PlanProvider>
    </AuthProvider>
  </StrictMode>,
)
