import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthProfileState } from '../lib/authState'

type ProtectedRouteProps = {
  children: ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
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

  if (adminOnly && !auth.viewer?.user?.isAdmin && auth.user?.role !== 'admin') {
    console.info('[RockHound redirect]', { route: location.pathname, decision: 'block-admin-only' })
    return <p className="empty-state">Admin access is required.</p>
  }

  console.info('[RockHound redirect]', { route: location.pathname, decision: 'allow-protected-route' })
  return children
}
