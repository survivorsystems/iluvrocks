import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthActions } from '@convex-dev/auth/react'
import { isDevAuthBypass } from '../lib/devAuth'
import { useAuthProfileState } from '../lib/authState'

export default function Login() {
  const navigate = useNavigate()
  const auth = useAuthProfileState()
  const { signIn, signOut } = useAuthActions()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('Enter your email to request a sign-in code.')
  const [requestedEmail, setRequestedEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpeningProfile, setIsOpeningProfile] = useState(false)

  useEffect(() => {
    if (!isOpeningProfile) return
    if (auth.state === 'authenticatedNoProfile') {
      navigate('/create-profile', { replace: true })
    }
    if (auth.state === 'authenticatedWithProfile') {
      navigate('/basecamp', { replace: true })
    }
  }, [auth.state, isOpeningProfile, navigate])

  useEffect(() => {
    if (!isOpeningProfile) return

    const timer = window.setTimeout(() => {
      setIsOpeningProfile(false)
      setMessage(
        'Code accepted, but RockHound could not confirm your session yet. Please try again in a private window.',
      )
    }, 10000)

    return () => window.clearTimeout(timer)
  }, [isOpeningProfile])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isDevAuthBypass) {
      navigate('/basecamp')
      return
    }

    const cleanEmail = normalizeEmail(email)
    const cleanCode = code.trim()

    if (cleanCode && requestedEmail && cleanEmail !== requestedEmail) {
      setMessage(`Use the same email address that requested the code: ${requestedEmail}.`)
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const result = await signIn(
        'resend-otp',
        cleanCode
          ? { email: cleanEmail, code: cleanCode, redirectTo: '/create-profile' }
          : { email: cleanEmail, redirectTo: '/create-profile' },
      )
      if (cleanCode) {
        if (result.signingIn) {
          setIsOpeningProfile(true)
          setMessage('Code accepted. Opening your profile...')
        } else {
          setMessage('That code was not accepted. Request a fresh code and try again.')
        }
      } else {
        setRequestedEmail(cleanEmail)
        setMessage(`Check ${cleanEmail} for your sign-in code.`)
      }
    } catch (error) {
      setMessage(getSignInErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (auth.state === 'loadingAuth') {
    return <p className="empty-state">Checking your sign-in...</p>
  }

  if (auth.state === 'authenticatedNoProfile' || auth.state === 'authenticatedWithProfile') {
    const destination = auth.state === 'authenticatedNoProfile' ? '/create-profile' : '/basecamp'
    return (
      <section className="auth-page">
        <div className="auth-form">
          <p className="eyebrow">Member access</p>
          <h1>You are signed in</h1>
          <p className="form-note">
            {auth.state === 'authenticatedNoProfile'
              ? 'Create your profile to unlock Basecamp.'
              : 'Welcome back. Basecamp is ready.'}
          </p>
          <Link to={destination} className="primary-action">
            Continue
          </Link>
          <button type="button" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <p className="eyebrow">Member access</p>
        <h1>Sign in</h1>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <label>
          Code
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Optional verification code"
          />
        </label>
        <button type="submit" disabled={isSubmitting || isOpeningProfile || auth.isLoading}>
          {isSubmitting || isOpeningProfile ? 'Working...' : code ? 'Verify code' : 'Request code'}
        </button>
        <p className="form-note">{message}</p>
        <Link to="/feed">Continue to feed</Link>
      </form>
    </section>
  )
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function getSignInErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''

  if (message.includes('Could not verify code')) {
    return 'That code was not accepted. Request a fresh code and try again.'
  }

  if (message.includes('Short verification code requires a matching `email`')) {
    return 'The email address must match the one that requested the code.'
  }

  if (message.includes('Missing environment variable')) {
    return 'RockHound sign-in is missing a server setting. Please try again after the latest deployment finishes.'
  }

  return message || 'Sign-in failed. Please try again.'
}
