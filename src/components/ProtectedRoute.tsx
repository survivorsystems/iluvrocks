import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthProfileState } from '../lib/authState'

type ProtectedRouteProps = {
  children: ReactNode
  adminOnly?: boolean
  requireProfile?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false, requireProfile = true }: ProtectedRouteProps) {
  const auth = useAuthProfileState()

  if (auth.state === 'loadingAuth') {
    return <p className="empty-state">Checking access...</p>
  }

  if (auth.state === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  if (auth.state === 'error') {
    return <p className="empty-state">RockHound could not confirm your session. Please sign out, then sign in again.</p>
  }

  if (requireProfile && auth.state === 'authenticatedNoProfile') {
    return <Navigate to="/create-profile" replace />
  }

  if (adminOnly && !auth.viewer?.user?.isAdmin && auth.user?.role !== 'admin') {
    return <p className="empty-state">Admin access is required.</p>
  }

  return children
}
