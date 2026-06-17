import { useState } from 'react'
import type { FormEvent } from 'react'
import { Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuthProfileState } from '../lib/authState'

export default function CreatePost() {
  const createPost = useMutation(api.social.createPost)
  const auth = useAuthProfileState()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!auth.isAuthenticated) {
    return (
      <aside className="composer">
        <p className="eyebrow">Ready to share?</p>
        <h2>Create your Basecamp</h2>
        <p className="form-note">
          Browse public discoveries freely. Create your Basecamp when you want to post, comment, save spots, or track
          your finds.
        </p>
        <div className="hero-actions">
          <Link to="/login" className="primary-action">
            Create your Basecamp
          </Link>
          <Link to="/membership" className="secondary-action">
            Membership info
          </Link>
        </div>
      </aside>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    if (!auth.isAuthenticated) {
      setStatus('Sign in before posting to the feed.')
      return
    }

    setIsSubmitting(true)

    try {
      await createPost({
        type: 'discussion',
        title: title.trim() || undefined,
        content: content.trim(),
        tags: ['rockhounding'],
      })
      setContent('')
      setTitle('')
      setStatus('Posted to the feed.')
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setStatus(message.includes('Unauthorized') ? 'Sign in before posting to the feed.' : 'Post could not be saved.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Weekend agate run"
        />
      </label>
      <label>
        Post
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Share a find, field note, or question..."
          required
          rows={4}
        />
      </label>
      <div className="form-footer">
        <span>{status}</span>
        <button type="submit" disabled={isSubmitting || !content.trim() || auth.isLoading}>
          <Send aria-hidden="true" />
          {isSubmitting ? 'Posting' : 'Post'}
        </button>
      </div>
    </form>
  )
}
