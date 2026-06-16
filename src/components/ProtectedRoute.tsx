import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAppAuth } from '../lib/devAuth'

type ProtectedRouteProps = {
  children: ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const auth = useAppAuth()

  if (auth.isLoading) {
    return <p className="empty-state">Checking access...</p>
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && auth.user?.role !== 'admin') {
    return <p className="empty-state">Admin access is required.</p>
  }

  return children
}
