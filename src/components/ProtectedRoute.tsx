import { Link, Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthProfileState } from '../lib/authState'

type ProtectedRouteProps = {
  children: ReactNode
  adminOnly?: boolean
  requireProfile?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false, requireProfile = true }: ProtectedRouteProps) {
  const auth = useAuthProfileState()
  const location = useLocation()

  if (auth.state === 'loadingAuth') {
    console.info('[RockHound redirect]', { route: location.pathname, decision: 'wait-for-auth' })
    return <p className="empty-state">Checking access...</p>
  }

  if (auth.state === 'unauthenticated') {
    console.info('[RockHound redirect]', { route: location.pathname, decision: 'redirect-to-login' })
    return <Navigate to="/login" replace />
  }

  if (auth.state === 'error') {
    console.info('[RockHound redirect]', { route: location.pathname, decision: 'session-not-confirmed' })
    return (
      <section className="auth-page">
        <div className="auth-form">
          <p className="eyebrow">Member access</p>
          <h1>Sign-in needs a fresh try</h1>
          <p className="form-note">
            RockHound could not confirm your signed-in session. Sign out, then request a new code.
          </p>
          <button type="button" onClick={() => void auth.signOut()}>
            Sign out
          </button>
          <Link to="/login">Try sign-in again</Link>
        </div>
      </section>
    )
  }

  if (requireProfile && auth.state === 'authenticatedNoProfile') {
    console.info('[RockHound redirect]', { route: location.pathname, decision: 'redirect-to-onboarding-profile' })
    return <Navigate to="/onboarding/profile" replace />
  }

  if (adminOnly && !auth.viewer?.user?.isAdmin && auth.user?.role !== 'admin') {
    console.info('[RockHound redirect]', { route: location.pathname, decision: 'block-admin-only' })
    return <p className="empty-state">Admin access is required.</p>
  }

  console.info('[RockHound redirect]', { route: location.pathname, decision: 'allow-protected-route' })
  return children
}
