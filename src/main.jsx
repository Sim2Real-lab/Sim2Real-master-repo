import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PageTransitionProvider } from './components/PageTransitionContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PageTransitionProvider>
      <App />
    </PageTransitionProvider>
  </StrictMode>,
)
