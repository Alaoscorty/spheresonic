import React from 'react' // React core
import ReactDOM from 'react-dom/client' // React DOM client
import App from './App.tsx' // Main App component
import './index.css' // Global styles (merged globals.css + fonts)

ReactDOM.createRoot(document.getElementById('root')!).render( // Create root and render
  <React.StrictMode> // StrictMode for development checks
    <App /> // App component
  </React.StrictMode>, // Close StrictMode
)
