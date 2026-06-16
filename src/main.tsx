import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexProvider } from 'convex/react'
import App from './App'
import { convex } from './lib/convex'
import './styles/app.css'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    {convex ? (
      <ConvexProvider client={convex}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConvexProvider>
    ) : (
      <MissingConvexUrl />
    )}
  </StrictMode>,
)

function MissingConvexUrl() {
  return (
    <main className="startup-error">
      <p className="eyebrow">Configuration needed</p>
      <h1>Missing Convex URL</h1>
      <p>
        Set <code>VITE_CONVEX_URL</code> in the deployment environment, then
        redeploy the site.
      </p>
    </main>
  )
}
