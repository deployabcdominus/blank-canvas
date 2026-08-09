import { createRoot } from 'react-dom/client'
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary'
import App from './App.tsx'
import './index.css'
import { initSentry } from './lib/monitoring'

// Initialize Sentry before the app renders
initSentry();

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);
