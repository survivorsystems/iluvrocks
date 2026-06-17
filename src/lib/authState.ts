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
  const shouldLoadViewer = !isDevAuthBypass && convexAuth.isAuthenticated
  const shouldLoadAuthDebug = !isDevAuthBypass && hasAuthToken
  const backendAuthDebug = useQuery((api as any).users.authDebug, shouldLoadAuthDebug ? {} : 'skip')
  const viewer = useQuery(api.users.viewer, shouldLoadViewer ? {} : 'skip')

  const state: AuthProfileState = isDevAuthBypass
    ? isCreatingProfile
      ? 'creatingProfile'
      : 'authenticatedWithProfile'
    : getAuthProfileState({
        isAuthLoading: convexAuth.isLoading,
        isAuthenticated: convexAuth.isAuthenticated,
        isViewerLoading: shouldLoadViewer && viewer === undefined,
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
        convexAuth,
        hasAuthToken,
        authTokenClaims: getPublicTokenClaims(authToken),
        backendAuthDebug,
      }
  useAuthDebugLog(result, location.pathname)
  return result
}

function getAuthProfileState({
  isAuthLoading,
  isAuthenticated,
  isViewerLoading,
  hasViewer,
  hasProfile,
  isCreatingProfile,
}: {
  isAuthLoading: boolean
  isAuthenticated: boolean
  isViewerLoading: boolean
  hasViewer: boolean
  hasProfile: boolean
  isCreatingProfile: boolean
}): AuthProfileState {
  if (isCreatingProfile) return 'creatingProfile'
  if (isAuthLoading) return 'loadingAuth'
  if (!isAuthenticated) return 'unauthenticated'
  if (isViewerLoading) return 'loadingAuth'
  if (!hasViewer) return 'authenticatedNoProfile'
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
    backendAuthDebug?: unknown
    authTokenClaims?: unknown
    hasAuthToken?: boolean
    convexAuth?: unknown
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
      convexAuth: 'convexAuth' in state ? state.convexAuth : undefined,
      hasAuthToken: 'hasAuthToken' in state ? state.hasAuthToken : undefined,
      tokenClaims: 'authTokenClaims' in state ? state.authTokenClaims : undefined,
      backendAuthDebug: 'backendAuthDebug' in state ? state.backendAuthDebug : undefined,
    })
  }, [
    pathname,
    state.backendAuthDebug,
    state.hasProfile,
    state.isAuthenticated,
    state.isDevMode,
    state.state,
    state.viewer,
  ])
}

function getPublicTokenClaims(token: string | null) {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4), '=')
    const decoded = JSON.parse(window.atob(paddedPayload)) as {
      iss?: string
      aud?: string | string[]
      exp?: number
    }
    return {
      issuer: decoded.iss,
      audience: decoded.aud,
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : undefined,
    }
  } catch {
    return { error: 'Could not decode token claims' }
  }
}
