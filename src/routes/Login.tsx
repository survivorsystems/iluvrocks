import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthActions } from '@convex-dev/auth/react'
import { isDevAuthBypass } from '../lib/devAuth'
import { useAuthProfileState } from '../lib/authState'

type AuthMode = 'signIn' | 'createAccount'

type LoginProps = {
  initialMode?: AuthMode
}

export default function Login({ initialMode = 'signIn' }: LoginProps) {
  const navigate = useNavigate()
  const auth = useAuthProfileState()
  const { signIn, signOut } = useAuthActions()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(getInitialMessage(initialMode))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingDestination, setPendingDestination] = useState<string | null>(null)

  const copy = useMemo(() => getModeCopy(mode), [mode])

  useEffect(() => {
    setMode(initialMode)
    setMessage(getInitialMessage(initialMode))
  }, [initialMode])

  useEffect(() => {
    if (!pendingDestination && auth.state !== 'authenticatedNoProfile' && auth.state !== 'authenticatedWithProfile') return

    if (auth.state === 'authenticatedNoProfile') {
      console.info('[RockHound redirect]', {
        route: '/login',
        authState: auth.state,
        decision: 'authenticated-new-or-incomplete-profile-open-onboarding',
      })
      navigate('/onboarding/profile', { replace: true })
      return
    }

    if (auth.state === 'authenticatedWithProfile') {
      const destination = pendingDestination === '/onboarding/profile' ? '/basecamp' : pendingDestination ?? '/basecamp'
      console.info('[RockHound redirect]', {
        route: '/login',
        authState: auth.state,
        decision: 'authenticated-existing-profile-open-destination',
        destination,
      })
      navigate(destination, { replace: true })
    }
  }, [auth.state, pendingDestination, navigate])

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setMessage(getInitialMessage(nextMode))
    setPassword('')
    setConfirmPassword('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isDevAuthBypass) {
      navigate('/basecamp')
      return
    }

    setMessage('')
    setIsSubmitting(true)

    try {
      const cleanEmail = normalizeEmail(email)
      const result = await submitAuthForm({
        mode,
        email: cleanEmail,
        displayName,
        password,
        confirmPassword,
        signIn,
      })

      const destination = result === 'createdAccount' ? '/onboarding/profile' : '/basecamp'
      setPendingDestination(destination)
      setMessage(
        result === 'createdAccount'
          ? 'Basecamp login created. Confirming your session before profile setup...'
          : 'Signed in. Confirming your session...',
      )
    } catch (error) {
      console.error('[RockHound auth submit failed]', {
        mode,
        message: error instanceof Error ? error.message : String(error),
      })
      setMessage(getSignInErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (auth.state === 'loadingAuth') {
    console.info('[RockHound redirect]', { route: '/login', decision: 'wait-for-auth' })
    return <p className="empty-state">Checking your sign-in...</p>
  }

  if (auth.state === 'error') {
    console.info('[RockHound redirect]', { route: '/login', decision: 'session-not-confirmed' })
    return (
      <section className="auth-page">
        <div className="auth-form">
          <p className="eyebrow">Member access</p>
          <h1>Sign-in needs a fresh try</h1>
          <p className="form-note">
            RockHound could not confirm your session. Sign out, then sign in again with your email and password.
          </p>
          <button type="button" onClick={() => void signOut()}>
            Sign out
          </button>
          <Link to="/login">Try sign-in again</Link>
        </div>
      </section>
    )
  }

  if (auth.state === 'authenticatedNoProfile' || auth.state === 'authenticatedWithProfile') {
    console.info('[RockHound redirect]', { route: '/login', decision: 'show-authenticated-continue', state: auth.state })
    return (
      <section className="auth-page">
        <div className="auth-form">
          <p className="eyebrow">Member access</p>
          <h1>You are signed in</h1>
          <p className="form-note">
            {auth.state === 'authenticatedNoProfile'
              ? 'Finish your basic profile to unlock Basecamp.'
              : 'Welcome back. Basecamp is ready.'}
          </p>
          <Link to={auth.state === 'authenticatedNoProfile' ? '/onboarding/profile' : '/basecamp'} className="primary-action">
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
        <p className="eyebrow">{mode === 'createAccount' ? 'Create your Basecamp' : 'Member access'}</p>
        <h1>{copy.title}</h1>
        <p className="form-note">{copy.note}</p>

        <div className="auth-switcher" aria-label="Authentication options">
          <button type="button" className={mode === 'signIn' ? 'is-active' : ''} onClick={() => switchMode('signIn')}>
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'createAccount' ? 'is-active' : ''}
            onClick={() => switchMode('createAccount')}
          >
            Create account
          </button>
        </div>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        {mode === 'createAccount' ? (
          <label>
            Name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Krista"
              autoComplete="name"
            />
          </label>
        ) : null}

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="9+ characters, 1 capital, 1 number, 1 symbol"
            autoComplete={mode === 'createAccount' ? 'new-password' : 'current-password'}
            minLength={9}
            required
          />
          {mode === 'createAccount' ? <PasswordRequirements password={password} /> : null}
        </label>

        {mode === 'createAccount' ? (
          <label>
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              minLength={9}
              required
            />
          </label>
        ) : null}

        <button type="submit" disabled={isSubmitting || !!pendingDestination || auth.isLoading}>
          {isSubmitting || pendingDestination ? 'Working...' : copy.button}
        </button>
        <p className="form-note">{message}</p>

        <div className="auth-links">
          {mode === 'signIn' ? (
            <Link to="/create-basecamp">Create your Basecamp</Link>
          ) : (
            <Link to="/login">Already have an account? Sign in</Link>
          )}
          <Link to="/feed">Browse public discoveries</Link>
        </div>
      </form>
    </section>
  )
}

async function submitAuthForm({
  mode,
  email,
  displayName,
  password,
  confirmPassword,
  signIn,
}: {
  mode: AuthMode
  email: string
  displayName: string
  password: string
  confirmPassword: string
  signIn: ReturnType<typeof useAuthActions>['signIn']
}): Promise<'signedIn' | 'createdAccount'> {
  if (!email || !email.includes('@')) throw new Error('Enter a valid email address.')

  if (mode === 'createAccount') {
    const passwordProblem = getPasswordProblem(password)
    if (passwordProblem) throw new Error(passwordProblem)
    if (password !== confirmPassword) throw new Error('Passwords do not match.')
    const result = await signIn('password', {
      flow: 'signUp',
      email,
      name: displayName.trim() || email.split('@')[0],
      password,
      redirectTo: '/onboarding/profile',
    })
    if (!result.signingIn) throw new Error('RockHound could not create that account.')
    return 'createdAccount'
  }

  const result = await signIn('password', { flow: 'signIn', email, password, redirectTo: '/basecamp' })
  if (!result.signingIn) throw new Error('RockHound could not sign you in.')
  return 'signedIn'
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function getInitialMessage(mode: AuthMode) {
  if (mode === 'createAccount') return 'Create your Basecamp login with an email and password.'
  return 'Sign in with your email and password.'
}

function getModeCopy(mode: AuthMode) {
  if (mode === 'createAccount') {
    return {
      title: 'Create your Basecamp',
      note: 'Use your email and create a strong password. These are the credentials you will use to log back in.',
      button: 'Create Basecamp',
    }
  }

  return {
    title: 'Sign in',
    note: 'Welcome back. Sign in with the password you created.',
    button: 'Sign in',
  }
}

function getSignInErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''

  if (message.includes('Invalid credentials')) return 'That email and password did not match.'
  if (message.includes('Could not create that account')) {
    return 'RockHound could not create that account. Try a different email, or sign in if you already created one.'
  }
  if (message.includes('Could not sign you in')) return 'RockHound could not sign you in with that email and password.'
  if (message.includes('Invalid password')) {
    return 'Password must be at least 9 characters and include 1 uppercase letter, 1 number, and 1 special character.'
  }
  if (message.includes('Password must be at least 9 characters')) {
    return 'Password must be at least 9 characters and include 1 uppercase letter, 1 number, and 1 special character.'
  }
  if (message.includes('already exists') || message.includes('Account already')) {
    return 'An account already exists for that email. Try signing in instead.'
  }
  if (message.includes('Missing environment variable')) {
    return 'RockHound sign-in is missing a server setting. Please try again after the latest deployment finishes.'
  }

  return message || 'Sign-in failed. Please try again.'
}

function PasswordRequirements({ password }: { password: string }) {
  const checks = [
    { label: '9 characters', met: password.length >= 9 },
    { label: '1 uppercase letter', met: /[A-Z]/.test(password) },
    { label: '1 number', met: /[0-9]/.test(password) },
    { label: '1 special character', met: /[^A-Za-z0-9]/.test(password) },
  ]

  return (
    <ul className="password-rules" aria-label="Password requirements">
      {checks.map((check) => (
        <li key={check.label} className={check.met ? 'is-met' : ''}>
          {check.label}
        </li>
      ))}
    </ul>
  )
}

function getPasswordProblem(password: string) {
  if (password.length < 9) return 'Password must be at least 9 characters.'
  if (!/[A-Z]/.test(password)) return 'Password must include at least 1 uppercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must include at least 1 number.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least 1 special character.'
  return null
}
