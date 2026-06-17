import { useAuthActions, useAuthToken } from '@convex-dev/auth/react'
import { useConvexAuth, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
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
  const [sessionWaitStartedAt, setSessionWaitStartedAt] = useState<number | null>(null)
  const [sessionConfirmationTimedOut, setSessionConfirmationTimedOut] = useState(false)

  const hasAuthToken = !!authToken
  const shouldLoadViewer = !isDevAuthBypass && (convexAuth.isAuthenticated || hasAuthToken)
  const viewer = useQuery(api.users.viewer, shouldLoadViewer ? {} : 'skip')
  const isWaitingForConfirmedViewer = !isDevAuthBypass && hasAuthToken && !convexAuth.isLoading && viewer === null

  useEffect(() => {
    if (!isWaitingForConfirmedViewer) {
      setSessionWaitStartedAt(null)
      setSessionConfirmationTimedOut(false)
      return
    }

    if (sessionWaitStartedAt === null) {
      setSessionWaitStartedAt(Date.now())
      return
    }

    const remainingMs = Math.max(0, 8000 - (Date.now() - sessionWaitStartedAt))
    const timer = window.setTimeout(() => {
      setSessionConfirmationTimedOut(true)
    }, remainingMs)

    return () => window.clearTimeout(timer)
  }, [isWaitingForConfirmedViewer, sessionWaitStartedAt])

  const state: AuthProfileState = isDevAuthBypass
    ? isCreatingProfile
      ? 'creatingProfile'
      : 'authenticatedWithProfile'
    : getAuthProfileState({
        isAuthLoading: convexAuth.isLoading,
        isAuthenticated: convexAuth.isAuthenticated,
        hasAuthToken,
        isViewerLoading: shouldLoadViewer && viewer === undefined,
        sessionConfirmationTimedOut,
        hasViewer: viewer !== null && viewer !== undefined,
        hasProfile: hasBasicProfile(viewer?.user),
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
        sessionConfirmationTimedOut,
      }
  useAuthDebugLog(result, location.pathname)
  return result
}

function getAuthProfileState({
  isAuthLoading,
  isAuthenticated,
  hasAuthToken,
  isViewerLoading,
  sessionConfirmationTimedOut,
  hasViewer,
  hasProfile,
  isCreatingProfile,
}: {
  isAuthLoading: boolean
  isAuthenticated: boolean
  hasAuthToken: boolean
  isViewerLoading: boolean
  sessionConfirmationTimedOut: boolean
  hasViewer: boolean
  hasProfile: boolean
  isCreatingProfile: boolean
}): AuthProfileState {
  if (isCreatingProfile) return 'creatingProfile'
  if (isAuthLoading && !hasAuthToken) return 'loadingAuth'
  if (!isAuthenticated && !hasAuthToken) return 'unauthenticated'
  if (isViewerLoading) return 'loadingAuth'
  if (sessionConfirmationTimedOut) return 'error'
  if (!hasViewer) return hasAuthToken ? 'loadingAuth' : 'unauthenticated'
  if (!hasProfile) return 'authenticatedNoProfile'
  return 'authenticatedWithProfile'
}

function hasBasicProfile(user: unknown) {
  if (!user || typeof user !== 'object') return false

  const profile = user as {
    name?: string
    email?: string
    location?: string
    yearsRockhounding?: number
  }

  return !!profile.name?.trim() && !!profile.email?.trim() && !!profile.location?.trim() && profile.yearsRockhounding !== undefined
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
      sessionConfirmationTimedOut: 'sessionConfirmationTimedOut' in state ? state.sessionConfirmationTimedOut : false,
    })
  }, [pathname, state.hasProfile, state.isAuthenticated, state.isDevMode, state.state, state.viewer])
}
