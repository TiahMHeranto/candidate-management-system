import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function enableA11y() {
  if (import.meta.env.DEV) {
    const axe = await import('@axe-core/react')
    const React = await import('react')

    axe.default(React, ReactDOM, 1000)
  }
}

enableA11y()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)