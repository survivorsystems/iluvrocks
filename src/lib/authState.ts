import { useAuthActions, useAuthToken } from '@convex-dev/auth/react'
import { useConvexAuth, useQuery } from 'convex/react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import { devUser, isDevAuthBypass } from './devAuth'

export type AuthProfileState =
  | 'loadingAuth'
  | 'unauthenticated'
  | 'authenticatedNoProfile'
  | 'authenticatedWithProfile'
  | 'creatingProfile'
  | 'error'

export function useAuthProfileState(isCreatingProfile = false) {
  const convexAuth = useConvexAuth()
  const authActions = useAuthActions()
  const authToken = useAuthToken()
  const location = useLocation()

  const hasAuthToken = !!authToken
  const shouldLoadViewer = !isDevAuthBypass && (convexAuth.isAuthenticated || hasAuthToken)
  const viewer = useQuery(api.users.viewer, shouldLoadViewer ? {} : 'skip')

  const state: AuthProfileState = isDevAuthBypass
    ? isCreatingProfile
      ? 'creatingProfile'
      : 'authenticatedWithProfile'
    : getAuthProfileState({
        isAuthLoading: convexAuth.isLoading,
        isAuthenticated: convexAuth.isAuthenticated,
        hasAuthToken,
        isViewerLoading: shouldLoadViewer && viewer === undefined,
        hasViewer: viewer !== undefined,
        hasProfile: !!viewer?.user?.username,
        isCreatingProfile,
      })

  const result = isDevAuthBypass
    ? {
        state,
        isDevMode: true,
        isLoading: false,
        isAuthenticated: true,
        hasProfile: true,
        viewer: {
          user: {
            _id: devUser.id,
            name: devUser.displayName,
            username: devUser.username,
            email: devUser.email,
            isAdmin: true,
            bio: 'Building RockHound and testing the local dev account.',
            location: 'Washington',
            homeRegion: 'Puget Sound',
            favoriteMinerals: ['Agate', 'Jasper', 'Quartz'],
            collectingStyles: ['Beach walks', 'River bars'],
            yearsRockhounding: 4,
          },
        },
        user: devUser,
        signOut: async () => undefined,
      }
    : {
        state,
        isDevMode: false,
        isLoading: state === 'loadingAuth',
        isAuthenticated:
          state === 'authenticatedNoProfile' || state === 'authenticatedWithProfile' || state === 'creatingProfile',
        hasProfile: state === 'authenticatedWithProfile',
        viewer: viewer ?? null,
        user: null,
        signOut: authActions.signOut,
      }
  useAuthDebugLog(result, location.pathname)
  return result
}

function getAuthProfileState({
  isAuthLoading,
  isAuthenticated,
  hasAuthToken,
  isViewerLoading,
  hasViewer,
  hasProfile,
  isCreatingProfile,
}: {
  isAuthLoading: boolean
  isAuthenticated: boolean
  hasAuthToken: boolean
  isViewerLoading: boolean
  hasViewer: boolean
  hasProfile: boolean
  isCreatingProfile: boolean
}): AuthProfileState {
  if (isCreatingProfile) return 'creatingProfile'
  if (isAuthLoading && !hasAuthToken) return 'loadingAuth'
  if (!isAuthenticated && !hasAuthToken) return 'unauthenticated'
  if (isViewerLoading) return 'loadingAuth'
  if (!hasViewer) return 'authenticatedNoProfile'
  if (!hasProfile) return 'authenticatedNoProfile'
  return 'authenticatedWithProfile'
}

function useAuthDebugLog(
  state: {
    state: AuthProfileState
    isDevMode: boolean
    isAuthenticated: boolean
    hasProfile: boolean
    viewer: unknown
  },
  pathname: string,
) {
  useEffect(() => {
    console.info('[RockHound auth]', {
      route: pathname,
      state: state.state,
      isAuthenticated: state.isAuthenticated,
      hasProfile: state.hasProfile,
      devAuthBypass: state.isDevMode,
      viewerStatus: state.viewer === undefined ? 'loading' : state.viewer === null ? 'none' : 'loaded',
    })
  }, [pathname, state.hasProfile, state.isAuthenticated, state.isDevMode, state.state, state.viewer])
}
