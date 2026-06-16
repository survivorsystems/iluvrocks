import { useAuthActions, useAuthToken } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'

export const isDevAuthBypass =
  import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'

export const devUser = {
  id: 'dev-user',
  username: 'chickensweets87',
  displayName: 'Krista',
  email: 'dev@rockhoundapp.app',
  role: 'admin',
} as const

export type AppUser = typeof devUser

export function useAppAuth() {
  const convexAuth = useConvexAuth()
  const authActions = useAuthActions()
  const authToken = useAuthToken()

  if (isDevAuthBypass) {
    return {
      isDevMode: true,
      isLoading: false,
      isAuthenticated: true,
      user: devUser,
      signOut: async () => undefined,
    }
  }

  return {
    isDevMode: false,
    isLoading: convexAuth.isLoading && !authToken,
    isAuthenticated: convexAuth.isAuthenticated || !!authToken,
    isServerConfirmed: convexAuth.isAuthenticated,
    user: null,
    signOut: authActions.signOut,
  }
}
