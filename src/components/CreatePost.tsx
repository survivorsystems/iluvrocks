import { useState } from 'react'
import type { FormEvent } from 'react'
import { Send } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function CreatePost() {
  const createPost = useMutation(api.social.createPost)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
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
      setStatus(error instanceof Error ? error.message : 'Sign in to create a post.')
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
        <button type="submit" disabled={isSubmitting || !content.trim()}>
          <Send aria-hidden="true" />
          {isSubmitting ? 'Posting' : 'Post'}
        </button>
      </div>
    </form>
  )
}
