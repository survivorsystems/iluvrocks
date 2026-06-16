import { useAuthActions } from '@convex-dev/auth/react'
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
    isLoading: convexAuth.isLoading,
    isAuthenticated: convexAuth.isAuthenticated,
    user: null,
    signOut: authActions.signOut,
  }
}
