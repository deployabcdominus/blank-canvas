import { createRoot } from 'react-dom/client'
import React, { Suspense, lazy } from 'react'

const FaviconGen = lazy(() => import('./generate-favicon'))

import { GlobalErrorBoundary } from './components/GlobalErrorBoundary'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <App />
    {import.meta.env.DEV && (
      <Suspense fallback={null}>
        <FaviconGen />
      </Suspense>
    )}
  </GlobalErrorBoundary>
);
