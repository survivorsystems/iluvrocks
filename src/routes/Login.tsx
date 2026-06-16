import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthActions } from '@convex-dev/auth/react'
import { useAppAuth, isDevAuthBypass } from '../lib/devAuth'

export default function Login() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, user } = useAppAuth()
  const { signIn, signOut } = useAuthActions()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('Enter your email to request a sign-in code.')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpeningProfile, setIsOpeningProfile] = useState(false)

  useEffect(() => {
    if (isOpeningProfile && isAuthenticated) {
      navigate('/profile', { replace: true })
    }
  }, [isAuthenticated, isOpeningProfile, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isDevAuthBypass) {
      navigate('/basecamp')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const result = await signIn(
        'resend-otp',
        code ? { email, code, redirectTo: '/profile' } : { email, redirectTo: '/profile' },
      )
      if (code) {
        if (result.signingIn) {
          setIsOpeningProfile(true)
          setMessage('Code accepted. Opening your profile...')
        } else {
          setMessage('That code was not accepted. Request a fresh code and try again.')
        }
      } else {
        setMessage(`Check ${email} for your sign-in code.`)
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign-in failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthenticated) {
    return (
      <section className="auth-page">
        <div className="auth-form">
          <p className="eyebrow">Member access</p>
          <h1>You are signed in</h1>
          <p className="form-note">
            {user ? `${user.displayName} is using the local dev account.` : 'Create or update your profile before posting.'}
          </p>
          <Link to="/profile" className="primary-action">
            Open profile setup
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
        <button type="submit" disabled={isSubmitting || isOpeningProfile || isLoading}>
          {isSubmitting || isOpeningProfile ? 'Working...' : code ? 'Verify code' : 'Request code'}
        </button>
        <p className="form-note">{message}</p>
        <Link to="/feed">Continue to feed</Link>
      </form>
    </section>
  )
}
